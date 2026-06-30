package com.waajud.judwaa.modules.datacollector.repository;

import com.waajud.judwaa.modules.datacollector.entity.DataCollectorState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DataCollectorStateRepository extends JpaRepository<DataCollectorState, String> {
}
