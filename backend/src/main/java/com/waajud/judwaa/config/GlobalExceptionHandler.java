package com.waajud.judwaa.config;

import com.waajud.judwaa.shared.JudwaaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(Exception.class)
	public JudwaaResponse<Object, String> handleAllExceptions(Exception ex) {
		logger.error("Unhandled exception occurred", ex);
		return JudwaaResponse.build(
				null,
				HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
				HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}
