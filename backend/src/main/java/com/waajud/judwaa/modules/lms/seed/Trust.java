package com.waajud.judwaa.modules.lms.seed;

import java.util.List;

public class Trust {
	private String name;
	private String code;
	private List<JsonSchool> schools;

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

	public List<JsonSchool> getSchools() {
		return schools;
	}

	public void setSchools(List<JsonSchool> schools) {
		this.schools = schools;
	}
}
