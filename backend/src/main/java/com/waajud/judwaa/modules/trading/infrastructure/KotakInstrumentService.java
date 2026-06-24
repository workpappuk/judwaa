package com.waajud.judwaa.modules.trading.infrastructure;

import com.waajud.judwaa.modules.trading.domain.KotakProperties;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
public class KotakInstrumentService {

	private final KotakProperties props;
	private final Object cacheLock = new Object();

	private volatile List<InstrumentPojo> cachedInstruments = List.of();
	private volatile String cachedSnapshotKey = "";

	public KotakInstrumentService(KotakProperties props) {
		this.props = props;
	}

	public List<InstrumentPojo> readAllCsvAsPojo() {
		Path latestFolder = resolveLatestDownloadFolder();
		List<Path> csvFiles = listCsvFiles(latestFolder);
		String currentSnapshotKey = buildSnapshotKey(latestFolder, csvFiles);

		if (currentSnapshotKey.equals(cachedSnapshotKey)) {
			return cachedInstruments;
		}

		synchronized (cacheLock) {
			if (currentSnapshotKey.equals(cachedSnapshotKey)) {
				return cachedInstruments;
			}

			List<InstrumentPojo> instruments = new ArrayList<>();
			for (Path csv : csvFiles) {
				instruments.addAll(parseCsv(csv));
			}

			cachedInstruments = List.copyOf(instruments);
			cachedSnapshotKey = currentSnapshotKey;
			return cachedInstruments;
		}
	}

	public PaginatedInstrumentResponse readAllCsvAsPojoPaginated(int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.max(1, size);

		List<InstrumentPojo> all = readAllCsvAsPojo();
		int totalElements = all.size();
		int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safeSize);

		if (totalElements == 0) {
			return new PaginatedInstrumentResponse(List.of(), safePage, safeSize, totalElements, totalPages, false,
					false);
		}

		int fromIndex = (safePage - 1) * safeSize;
		if (fromIndex >= totalElements) {
			return new PaginatedInstrumentResponse(List.of(), safePage, safeSize, totalElements, totalPages,
					safePage > 1, false);
		}

		int toIndex = Math.min(fromIndex + safeSize, totalElements);
		List<InstrumentPojo> pageContent = all.subList(fromIndex, toIndex);
		boolean hasPrevious = safePage > 1;
		boolean hasNext = safePage < totalPages;

		return new PaginatedInstrumentResponse(pageContent, safePage, safeSize, totalElements, totalPages, hasPrevious,
				hasNext);
	}

	private List<Path> listCsvFiles(Path folder) {
		try (Stream<Path> files = Files.list(folder)) {
			return files.filter(Files::isRegularFile).filter(path -> path.getFileName().toString().endsWith(".csv"))
					.sorted(Comparator.comparing(path -> path.getFileName().toString())).toList();
		} catch (IOException e) {
			throw new RuntimeException("Failed to read CSV files from: " + folder, e);
		}
	}

	private String buildSnapshotKey(Path folder, List<Path> csvFiles) {
		StringBuilder key = new StringBuilder(folder.toAbsolutePath().toString());

		for (Path csv : csvFiles) {
			try {
				key.append('|').append(csv.getFileName()).append(':').append(Files.size(csv)).append(':')
						.append(Files.getLastModifiedTime(csv).toMillis());
			} catch (IOException e) {
				throw new RuntimeException("Failed to inspect CSV file metadata: " + csv, e);
			}
		}

		return key.toString();
	}

	private Path resolveLatestDownloadFolder() {
		Path downloadRoot = Path.of(props.getDownloadRoot());

		if (!Files.exists(downloadRoot) || !Files.isDirectory(downloadRoot)) {
			throw new IllegalStateException("Download root not found: " + downloadRoot.toAbsolutePath());
		}

		try (Stream<Path> dirs = Files.list(downloadRoot)) {
			return dirs.filter(Files::isDirectory).max(Comparator.comparing(path -> path.getFileName().toString()))
					.orElseThrow(() -> new IllegalStateException("No dated folder found in: " + downloadRoot));
		} catch (IOException e) {
			throw new RuntimeException("Failed to inspect download root: " + downloadRoot, e);
		}
	}

	private List<InstrumentPojo> parseCsv(Path csvPath) {
		try (BufferedReader reader = Files.newBufferedReader(csvPath)) {
			String headerLine = reader.readLine();
			if (headerLine == null || headerLine.isBlank()) {
				return List.of();
			}

			List<String> headers = parseCsvLine(headerLine).stream().map(this::normalizeHeader).toList();

			List<InstrumentPojo> rows = new ArrayList<>();
			String line;
			int rowNumber = 0;

			while ((line = reader.readLine()) != null) {
				if (line.isBlank()) {
					continue;
				}

				rowNumber++;
				List<String> values = parseCsvLine(line);
				Map<String, String> fieldMap = toFieldMap(headers, values);
				rows.add(toPojo(csvPath.getFileName().toString(), rowNumber, fieldMap));
			}
			return rows;
		} catch (IOException e) {
			throw new RuntimeException("Failed to parse CSV: " + csvPath, e);
		}
	}

	private Map<String, String> toFieldMap(List<String> headers, List<String> values) {
		Map<String, String> row = new LinkedHashMap<>();
		for (int i = 0; i < headers.size(); i++) {
			String value = i < values.size() ? values.get(i).trim() : "";
			row.put(headers.get(i), value);
		}
		return row;
	}

	private InstrumentPojo toPojo(String sourceFile, int rowNumber, Map<String, String> row) {
		InstrumentPojo pojo = new InstrumentPojo();
		pojo.sourceFile = sourceFile;
		pojo.rowNumber = rowNumber;
		pojo.exchangeSegment = valueOf(row, "pExchSeg");
		pojo.instrumentType = valueOf(row, "pInstType");
		pojo.symbol = valueOf(row, "pSymbol");
		pojo.tradingSymbol = valueOf(row, "pTrdSymbol");
		pojo.optionType = valueOf(row, "pOptionType");
		pojo.exchange = valueOf(row, "pExchange");
		pojo.expiryDate = valueOf(row, "pExpiryDate", "lExpiryDate");
		pojo.lotSize = valueOf(row, "lLotSize");
		pojo.strikePrice = valueOf(row, "dStrikePrice");
		pojo.fields = row;
		return pojo;
	}

	private String valueOf(Map<String, String> row, String... names) {
		for (String name : names) {
			String key = normalizeHeader(name);
			if (row.containsKey(key)) {
				return row.get(key);
			}
		}
		return "";
	}

	private String normalizeHeader(String header) {
		String normalized = header == null ? "" : header.trim();
		while (normalized.endsWith(";") || normalized.endsWith(",")) {
			normalized = normalized.substring(0, normalized.length() - 1).trim();
		}
		return normalized;
	}

	private List<String> parseCsvLine(String line) {
		List<String> values = new ArrayList<>();
		StringBuilder current = new StringBuilder();
		boolean inQuotes = false;

		for (int i = 0; i < line.length(); i++) {
			char ch = line.charAt(i);

			if (ch == '"') {
				if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
					current.append('"');
					i++;
				} else {
					inQuotes = !inQuotes;
				}
				continue;
			}

			if (ch == ',' && !inQuotes) {
				values.add(current.toString());
				current.setLength(0);
				continue;
			}

			current.append(ch);
		}

		values.add(current.toString());
		return values;
	}

	public static class InstrumentPojo {
		public String sourceFile;
		public int rowNumber;
		public String exchangeSegment;
		public String instrumentType;
		public String symbol;
		public String tradingSymbol;
		public String optionType;
		public String exchange;
		public String expiryDate;
		public String lotSize;
		public String strikePrice;
		public Map<String, String> fields;
	}

	public static class PaginatedInstrumentResponse {
		public List<InstrumentPojo> content;
		public int page;
		public int size;
		public int totalElements;
		public int totalPages;
		public boolean hasPrevious;
		public boolean hasNext;

		public PaginatedInstrumentResponse(List<InstrumentPojo> content, int page, int size, int totalElements,
				int totalPages, boolean hasPrevious, boolean hasNext) {
			this.content = content;
			this.page = page;
			this.size = size;
			this.totalElements = totalElements;
			this.totalPages = totalPages;
			this.hasPrevious = hasPrevious;
			this.hasNext = hasNext;
		}
	}
}