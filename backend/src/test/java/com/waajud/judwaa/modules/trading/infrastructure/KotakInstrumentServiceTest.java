package com.waajud.judwaa.modules.trading.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.waajud.judwaa.modules.trading.domain.KotakProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class KotakInstrumentServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void readAllCsvAsPojoPaginated_returnsPageMetadata() throws Exception {
        Path root = tempDir.resolve("downloads");
        Path oldDir = root.resolve("20260714");
        Path latestDir = root.resolve("20260715");
        Files.createDirectories(oldDir);
        Files.createDirectories(latestDir);

        Files.writeString(latestDir.resolve("a.csv"),
                "pExchSeg,pInstType,pSymbol,pTrdSymbol,pOptionType,pExchange,lExpiryDate,lLotSize,dStrikePrice\n"
                        + "nse,OPT,NIFTY,\"NIFTY 50\",CE,NSE,2026-07-31,50,25000\n"
                        + "nse,OPT,BANKNIFTY,BANKNIFTY,PE,NSE,2026-07-31,15,52000\n"
                        + "nse,OPT,FINNIFTY,FINNIFTY,CE,NSE,2026-07-31,40,23000\n");

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        KotakInstrumentService.PaginatedInstrumentResponse page1 = service.readAllCsvAsPojoPaginated(1, 2);

        assertEquals(2, page1.content.size());
        assertEquals(3, page1.totalElements);
        assertEquals(2, page1.totalPages);
        assertTrue(page1.hasNext);

        KotakInstrumentService.PaginatedInstrumentResponse page99 = service.readAllCsvAsPojoPaginated(99, 2);
        assertEquals(0, page99.content.size());
    }

    @Test
    void readAllCsvAsPojoPaginated_emptyCsv_returnsEmptyResponse() throws Exception {
        Path root = tempDir.resolve("downloads");
        Path latestDir = root.resolve("20260715");
        Files.createDirectories(latestDir);
        Files.writeString(latestDir.resolve("a.csv"), "");

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        KotakInstrumentService.PaginatedInstrumentResponse page = service.readAllCsvAsPojoPaginated(1, 10);
        assertEquals(0, page.content.size());
        assertEquals(0, page.totalElements);
    }

    @Test
    void readAllCsvAsPojoPaginated_missingRoot_throws() {
        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(tempDir.resolve("missing").toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        assertThrows(IllegalStateException.class, () -> service.readAllCsvAsPojoPaginated(1, 10));
    }

    @Test
    void readAllCsvAsPojoPaginated_rootWithoutDatedFolders_throws() throws Exception {
        Path root = tempDir.resolve("downloads");
        Files.createDirectories(root);

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        assertThrows(IllegalStateException.class, () -> service.readAllCsvAsPojoPaginated(1, 10));
    }

    @Test
    void readAllCsvAsPojo_usesDefaultPageSizeAndNormalizesInput() throws Exception {
        Path root = tempDir.resolve("downloads");
        Path latestDir = root.resolve("20260715");
        Files.createDirectories(latestDir);
        Files.writeString(latestDir.resolve("a.csv"),
                "pExchSeg,pInstType,pSymbol,pTrdSymbol,pOptionType,pExchange,lExpiryDate,lLotSize,dStrikePrice\n"
                        + "nse,OPT,NIFTY,NIFTY,CE,NSE,2026-07-31,50,25000\n");

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        assertEquals(1, service.readAllCsvAsPojo().size());
        KotakInstrumentService.PaginatedInstrumentResponse page = service.readAllCsvAsPojoPaginated(-1, 0);
        assertEquals(1, page.page);
        assertEquals(1, page.size);
    }

    @Test
    void readAllCsvAsPojoPaginated_secondPage_setsHasPreviousAndParsesQuotedValues() throws Exception {
        Path root = tempDir.resolve("downloads");
        Path latestDir = root.resolve("20260715");
        Files.createDirectories(latestDir);
        Files.writeString(latestDir.resolve("a.csv"),
                "pExchSeg,pInstType,pSymbol,pTrdSymbol,pOptionType,pExchange,pExpiryDate;,lLotSize,dStrikePrice\n"
                        + "nse,OPT,NIFTY,\"NIFTY, 50\",CE,NSE,2026-07-31,50,25000\n"
                        + "nse,OPT,BANKNIFTY,BANKNIFTY,PE,NSE,2026-07-31,15,52000\n"
                        + "\n"
                        + "nse,OPT,FINNIFTY,FINNIFTY,CE,NSE,2026-07-31,40,23000\n");

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        KotakInstrumentService.PaginatedInstrumentResponse page2 = service.readAllCsvAsPojoPaginated(2, 2);

        assertEquals(1, page2.content.size());
        assertEquals(true, page2.hasPrevious);
        assertEquals(false, page2.hasNext);
        assertEquals("2026-07-31", page2.content.get(0).expiryDate);
    }

    @Test
    void readAllCsvAsPojoPaginated_blankHeaderLine_returnsEmpty() throws Exception {
        Path root = tempDir.resolve("downloads");
        Path latestDir = root.resolve("20260715");
        Files.createDirectories(latestDir);
        Files.writeString(latestDir.resolve("a.csv"), "   \nrow1\n");

        KotakProperties props = new KotakProperties();
        props.setDownloadRoot(root.toString());
        KotakInstrumentService service = new KotakInstrumentService(props);

        KotakInstrumentService.PaginatedInstrumentResponse page = service.readAllCsvAsPojoPaginated(1, 10);

        assertEquals(0, page.content.size());
        assertEquals(0, page.totalElements);
    }
}
