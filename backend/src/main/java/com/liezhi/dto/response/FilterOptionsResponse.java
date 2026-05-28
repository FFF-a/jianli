package com.liezhi.dto.response;

import java.util.List;

public class FilterOptionsResponse {
    private List<String> cities;
    private List<String> salaries;
    private List<String> experiences;
    private List<String> educations;
    private List<String> types;

    public List<String> getCities() { return cities; }
    public void setCities(List<String> cities) { this.cities = cities; }
    public List<String> getSalaries() { return salaries; }
    public void setSalaries(List<String> salaries) { this.salaries = salaries; }
    public List<String> getExperiences() { return experiences; }
    public void setExperiences(List<String> experiences) { this.experiences = experiences; }
    public List<String> getEducations() { return educations; }
    public void setEducations(List<String> educations) { this.educations = educations; }
    public List<String> getTypes() { return types; }
    public void setTypes(List<String> types) { this.types = types; }
}
