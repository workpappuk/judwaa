package com.waajud.judwaa.shared;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class JudwaaResponse<D, M> {
    D data;
    M message;
    HttpStatus status;
    LocalDateTime  timestamp;

    public JudwaaResponse(D data, M message, HttpStatus status) {
        this.data = data;
        this.message = message;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public static <D, M> JudwaaResponse<D, M> build(D data, M message, HttpStatus status) {
        return new JudwaaResponse<>(data, message, status);
    }
}
