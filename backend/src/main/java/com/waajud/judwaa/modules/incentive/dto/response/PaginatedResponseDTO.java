package com.waajud.judwaa.modules.incentive.dto.response;

import java.util.List;

import org.springframework.data.domain.Page;

public class PaginatedResponseDTO<T> {
	private List<T> content;
	private int page;
	private int size;
	private long totalElements;
	private int totalPages;
	private boolean hasPrevious;
	private boolean hasNext;

	public static <T> PaginatedResponseDTO<T> fromPage(Page<T> pageData) {
		PaginatedResponseDTO<T> response = new PaginatedResponseDTO<>();
		response.setContent(pageData.getContent());
		response.setPage(pageData.getNumber() + 1);
		response.setSize(pageData.getSize());
		response.setTotalElements(pageData.getTotalElements());
		response.setTotalPages(pageData.getTotalPages());
		response.setHasPrevious(pageData.hasPrevious());
		response.setHasNext(pageData.hasNext());
		return response;
	}

	public List<T> getContent() {
		return content;
	}

	public void setContent(List<T> content) {
		this.content = content;
	}

	public int getPage() {
		return page;
	}

	public void setPage(int page) {
		this.page = page;
	}

	public int getSize() {
		return size;
	}

	public void setSize(int size) {
		this.size = size;
	}

	public long getTotalElements() {
		return totalElements;
	}

	public void setTotalElements(long totalElements) {
		this.totalElements = totalElements;
	}

	public int getTotalPages() {
		return totalPages;
	}

	public void setTotalPages(int totalPages) {
		this.totalPages = totalPages;
	}

	public boolean isHasPrevious() {
		return hasPrevious;
	}

	public void setHasPrevious(boolean hasPrevious) {
		this.hasPrevious = hasPrevious;
	}

	public boolean isHasNext() {
		return hasNext;
	}

	public void setHasNext(boolean hasNext) {
		this.hasNext = hasNext;
	}
}
