package com.waajud.judwaa.modules.trading.domain;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.kotak.neo")
public class KotakProperties {
    private boolean enabled;
    private String authorization;
    private String mobileNumber;
    private String ucc;
    private String mpin;
    private String loginUrl;
    private String sessionFile;
    private String downloadRoot;
    private String filePathsEndpoint;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getAuthorization() {
        return authorization;
    }

    public void setAuthorization(String authorization) {
        this.authorization = authorization;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getUcc() {
        return ucc;
    }

    public void setUcc(String ucc) {
        this.ucc = ucc;
    }

    public String getMpin() {
        return mpin;
    }

    public void setMpin(String mpin) {
        this.mpin = mpin;
    }

    public String getLoginUrl() {
        return loginUrl;
    }

    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }

    public String getSessionFile() {
        return sessionFile;
    }

    public void setSessionFile(String sessionFile) {
        this.sessionFile = sessionFile;
    }

    public String getDownloadRoot() {
        return downloadRoot;
    }

    public void setDownloadRoot(String downloadRoot) {
        this.downloadRoot = downloadRoot;
    }

    public String getFilePathsEndpoint() {
        return filePathsEndpoint;
    }

    public void setFilePathsEndpoint(String filePathsEndpoint) {
        this.filePathsEndpoint = filePathsEndpoint;
    }
}