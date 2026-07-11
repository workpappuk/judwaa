package com.waajud.judwaa.shared;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class JudwaaResponse<D, M> {
    private D data;
    private M message;
    private HttpStatus status;
    private LocalDateTime timestamp;

    public JudwaaResponse(D data, M message, HttpStatus status) {
        this.data = data;
        this.message = message;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public static <D, M> JudwaaResponse<D, M> build(D data, M message, HttpStatus status) {
        return new JudwaaResponse<>(data, message, status);
    }

    public D getData() {
        return data;
    }

    public void setData(D data) {
        this.data = data;
    }

    public M getMessage() {
        return message;
    }

    public void setMessage(M message) {
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public void setStatus(HttpStatus status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
