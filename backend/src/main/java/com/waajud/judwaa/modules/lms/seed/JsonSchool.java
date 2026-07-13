package com.waajud.judwaa.modules.lms.seed;

import java.util.List;
import java.util.Set;

public class JsonSchool {
	private String name;
	private String code;
	private Set<String> board;
	private List<JsonClassroom> classrooms;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Set<String> getBoard() {
		return board;
	}

	public void setBoard(Set<String> board) {
		this.board = board;
	}

	public List<JsonClassroom> getClassrooms() {
		return classrooms;
	}

	public void setClassrooms(List<JsonClassroom> classrooms) {
		this.classrooms = classrooms;
	}
}
