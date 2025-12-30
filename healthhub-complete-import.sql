-- ==================== HEALTHHUB MANAGER - ENHANCED VERSION ====================
-- Advanced Healthcare Database with Automation, Triggers, and Procedures
-- Features: Supervisor hierarchy, automatic patient allocation, audit trails

USE healthhub_db;

-- ==================== PART 1: DROP EXISTING TABLES (CLEAN SLATE) ====================

DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS SupervisorSignOff;
DROP TABLE IF EXISTS `Tested for`;
DROP TABLE IF EXISTS Writes;
DROP TABLE IF EXISTS Prescriptions;
DROP TABLE IF EXISTS Report;
DROP TABLE IF EXISTS Tests;
DROP TABLE IF EXISTS Drugs;
DROP TABLE IF EXISTS Patient;
DROP TABLE IF EXISTS MedicalPersonnel;

-- ==================== PART 2: CREATE ENHANCED TABLES ====================

-- TABLE 1: MEDICAL PERSONNEL (with supervisor hierarchy built-in)
CREATE TABLE MedicalPersonnel (
    MedicalPersonnelId VARCHAR(10) PRIMARY KEY,
    Fname VARCHAR(50) NOT NULL,
    Lname VARCHAR(50) NOT NULL,
    Specialty VARCHAR(100),
    Understudy TEXT,
    Contacts VARCHAR(20),
    DoctorId VARCHAR(10),                    -- If they're a doctor, their doctor ID
    License VARCHAR(20) NOT NULL,
    MalpractiseInsurance VARCHAR(20),
    Supervisor VARCHAR(10),                  -- WHO supervises this person
    PatientLoad INT DEFAULT 0,               -- HOW MANY patients assigned (auto-tracked!)
    Status ENUM('Active', 'OnLeave', 'Retired') DEFAULT 'Active',
    HireDate DATE DEFAULT (CURRENT_DATE),
    INDEX idx_specialty (Specialty),
    INDEX idx_supervisor (Supervisor),
    INDEX idx_status (Status)
) COMMENT='Medical staff with hierarchical supervision and automated patient load tracking';

-- TABLE 2: PATIENT (with automatic doctor assignment)
CREATE TABLE Patient (
    patientId VARCHAR(10) PRIMARY KEY,
    Fname VARCHAR(50) NOT NULL,
    Lname VARCHAR(50) NOT NULL,
    `Medical History` TEXT,
    Diagnosis TEXT,
    Diet VARCHAR(100),
    Waivers TEXT,
    Address VARCHAR(200),
    Phone VARCHAR(20),
    ECname VARCHAR(100),                     -- Emergency contact name
    ECcontact VARCHAR(20),                   -- Emergency contact phone
    Birthdate DATE,
    Discharge BOOLEAN DEFAULT 0,
    AssignedDoctorId VARCHAR(10),            -- Assigned doctor (auto-allocated!) - references MedicalPersonnelId
    AdmissionDate DATE DEFAULT (CURRENT_DATE),
    DischargeDate DATE,
    INDEX idx_doctor (AssignedDoctorId),
    INDEX idx_discharge (Discharge),
    FOREIGN KEY (AssignedDoctorId) REFERENCES MedicalPersonnel(MedicalPersonnelId) ON UPDATE CASCADE
) COMMENT='Patients with automatic doctor assignment and discharge tracking';

-- TABLE 3: DRUGS
CREATE TABLE Drugs (
    DrugsId VARCHAR(10) PRIMARY KEY,
    DrugsName VARCHAR(100) NOT NULL,
    Dosage VARCHAR(50),
    Generics VARCHAR(100),
    DrugsAllergensl VARCHAR(100),
    StockLevel INT DEFAULT 100,              -- Track inventory
    MinimumStock INT DEFAULT 20,             -- Alert threshold
    INDEX idx_stock (StockLevel)
) COMMENT='Drug inventory with stock level monitoring';

-- TABLE 4: TESTS
CREATE TABLE Tests (
    TestsId VARCHAR(10) PRIMARY KEY,
    TestName VARCHAR(100) NOT NULL,
    `Testing Department` VARCHAR(100),
    `Test requirements` TEXT,
    Cost DECIMAL(10,2) DEFAULT 0.00,         -- Test cost
    Duration INT DEFAULT 30                   -- Duration in minutes
) COMMENT='Available medical tests with cost and time tracking';

-- TABLE 5: PRESCRIPTIONS
CREATE TABLE Prescriptions (
    PrescriptionsId VARCHAR(10) PRIMARY KEY,
    PatientID VARCHAR(10),
    DoctorID VARCHAR(10),                    -- This stores MedicalPersonnelId, not DoctorId!
    DrugID VARCHAR(10),
    Prescription TEXT,
    RefillDate DATE,
    Date DATE,
    RefillsRemaining INT DEFAULT 3,          -- Track refill count
    Status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    INDEX idx_refill (RefillDate),
    INDEX idx_status (Status),
    FOREIGN KEY (PatientID) REFERENCES Patient(patientId) ON DELETE CASCADE,
    FOREIGN KEY (DoctorID) REFERENCES MedicalPersonnel(MedicalPersonnelId),  -- Fixed!
    FOREIGN KEY (DrugID) REFERENCES Drugs(DrugsId)
) COMMENT='Prescriptions with automatic refill tracking';

-- TABLE 6: REPORT
CREATE TABLE Report (
    reportId VARCHAR(10) PRIMARY KEY,
    reportType VARCHAR(10),
    report TEXT,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE 7: SITUATION REPORTS (WRITES)
CREATE TABLE Writes (
    SitRepId VARCHAR(10) PRIMARY KEY,
    Reportid VARCHAR(10),
    Patient VARCHAR(10),
    `Situation Report` TEXT,
    Date DATE,
    MedicalPersonnel VARCHAR(10),            -- This stores MedicalPersonnelId!
    Severity ENUM('Routine', 'Important', 'Urgent') DEFAULT 'Routine',
    FOREIGN KEY (Patient) REFERENCES Patient(patientId) ON DELETE CASCADE,
    FOREIGN KEY (MedicalPersonnel) REFERENCES MedicalPersonnel(MedicalPersonnelId),  -- Fixed!
    FOREIGN KEY (Reportid) REFERENCES Report(reportId)
);

-- TABLE 8: TEST SCHEDULING
CREATE TABLE `Tested for` (
    SchedTest VARCHAR(10) PRIMARY KEY,
    Patient VARCHAR(10),
    TestId VARCHAR(10),
    `Scheduled on` DATE,
    Date DATE,
    Status ENUM('Scheduled', 'Completed', 'Cancelled', 'NoShow') DEFAULT 'Scheduled',
    Results TEXT,                            -- Test results
    FOREIGN KEY (Patient) REFERENCES Patient(patientId) ON DELETE CASCADE,
    FOREIGN KEY (TestId) REFERENCES Tests(TestsId)
);

-- TABLE 9: SUPERVISOR SIGN-OFF (ENHANCED)
CREATE TABLE SupervisorSignOff (
    SignOffId INT AUTO_INCREMENT PRIMARY KEY,
    PatientId VARCHAR(10),
    SupervisorId VARCHAR(10),
    DoctorId VARCHAR(10),                    -- Doctor who needs approval (stores MedicalPersonnelId)
    SignOffDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ApprovalStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    Comments VARCHAR(255),
    Category ENUM('Treatment', 'Prescription', 'Procedure', 'Discharge') DEFAULT 'Treatment',
    INDEX idx_status (ApprovalStatus),
    INDEX idx_supervisor (SupervisorId),
    FOREIGN KEY (PatientId) REFERENCES Patient(patientId) ON DELETE CASCADE,
    FOREIGN KEY (SupervisorId) REFERENCES MedicalPersonnel(MedicalPersonnelId),  -- Fixed!
    FOREIGN KEY (DoctorId) REFERENCES MedicalPersonnel(MedicalPersonnelId)       -- Fixed!
) COMMENT='Supervisor approval system with automatic status tracking';

-- TABLE 10: AUDIT LOG (NEW - Track all changes!)
CREATE TABLE AuditLog (
    LogId INT AUTO_INCREMENT PRIMARY KEY,
    TableName VARCHAR(50),
    RecordId VARCHAR(10),
    Action ENUM('INSERT', 'UPDATE', 'DELETE'),
    ChangedBy VARCHAR(10),
    ChangeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    OldValue TEXT,
    NewValue TEXT,
    INDEX idx_table (TableName),
    INDEX idx_date (ChangeDate)
) COMMENT='Complete audit trail of all database changes';

-- ==================== PART 3: INSERT INITIAL DATA ====================

-- INSERT MEDICAL PERSONNEL (with supervisor hierarchy using MedicalPersonnelId)
INSERT INTO MedicalPersonnel (MedicalPersonnelId, Fname, Lname, Specialty, Understudy, Contacts, DoctorId, License, MalpractiseInsurance, Supervisor, Status, HireDate) VALUES
-- DOCTORS (supervise each other in pairs - using MedicalPersonnelId for Supervisor!)
('MP001', 'John', 'Doe', 'Family Medicine', 'Alice Smith, Bob Johnson', '123-456-7890', 'DOC01', 'LIC12345', 'INS12345', 'MP002', 'Active', '2020-01-15'),  -- Supervised by MP002 (DOC02)
('MP002', 'Jane', 'Smith', 'Internal Medicine', 'Carol Williams, David Brown', '234-567-8901', 'DOC02', 'LIC23456', 'INS23456', 'MP001', 'Active', '2020-02-20'),  -- Supervised by MP001 (DOC01)
('MP003', 'Alice', 'Johnson', 'Pediatrics', 'Eve Davis, Frank Miller', '345-678-9012', 'DOC03', 'LIC34567', 'INS34567', 'MP004', 'Active', '2019-06-10'),  -- Supervised by MP004 (DOC04)
('MP004', 'Bob', 'Williams', 'Surgery', 'Grace Wilson, Henry Moore', '456-789-0123', 'DOC04', 'LIC45678', 'INS45678', 'MP003', 'Active', '2019-07-15'),  -- Supervised by MP003 (DOC03)
('MP005', 'Carol', 'Brown', 'Psychiatry', 'Ivy Taylor, Jack Davis', '567-890-1234', 'DOC05', 'LIC56789', 'INS56789', 'MP006', 'Active', '2021-03-05'),  -- Supervised by MP006 (DOC06)
('MP006', 'David', 'Davis', 'Family Medicine', 'John Doe, Jane Smith', '678-901-2345', 'DOC06', 'LIC67890', 'INS67890', 'MP005', 'Active', '2021-04-12'),  -- Supervised by MP005 (DOC05)
('MP007', 'Eve', 'Miller', 'Internal Medicine', 'Alice Johnson, Bob Williams', '789-012-3456', 'DOC07', 'LIC78901', 'INS78901', 'MP008', 'Active', '2018-09-20'),  -- Supervised by MP008 (DOC08)
('MP008', 'Frank', 'Wilson', 'Pediatrics', 'Carol Brown, David Davis', '890-123-4567', 'DOC08', 'LIC89012', 'INS89012', 'MP007', 'Active', '2018-10-25'),  -- Supervised by MP007 (DOC07)
('MP009', 'Grace', 'Moore', 'Surgery', 'Eve Miller, Frank Wilson', '901-234-5678','DOC09', 'LIC90123', 'INS90123', 'MP010', 'Active', '2022-01-10'),  -- Supervised by MP010 (DOC10)
('MP010', 'Henry', 'Taylor', 'Psychiatry', 'Grace Moore, Henry Taylor', '012-345-6789', 'DOC10', 'LIC01234', 'INS01234', 'MP009', 'Active', '2022-02-15'),  -- Supervised by MP009 (DOC09)
-- NURSES (supervised by senior RNs - using MedicalPersonnelId!)
('MP011', 'Ivy', 'Taylor', 'Registered Nurse', 'None', '123-456-7890', NULL, 'RN12345', 'INS12345', NULL, 'Active', '2021-05-01'),  -- Senior RN, no supervisor
('MP012', 'Jack', 'Davis', 'Licensed Practical Nurse', 'None', '234-567-8901', NULL, 'LPN23456', 'INS23456', 'MP011', 'Active', '2021-06-10'),  -- Supervised by MP011 (RN12345)
('MP013', 'Karen', 'White', 'Certified Nursing Assistant', 'None', '345-678-9012', NULL, 'CNA34567', 'INS34567', 'MP011', 'Active', '2022-03-15'),  -- Supervised by MP011 (RN12345)
('MP014', 'Laura', 'Green', 'Registered Nurse', 'None', '456-789-0123', NULL, 'RN45678', 'INS45678', NULL, 'Active', '2020-08-20'),  -- Senior RN, no supervisor
('MP015', 'Michael', 'Brown', 'Licensed Practical Nurse', 'None', '567-890-1234', NULL, 'LPN56789', 'INS56789', 'MP014', 'Active', '2021-09-05'),  -- Supervised by MP014 (RN45678)
('MP016', 'Nancy', 'Black', 'Certified Nursing Assistant', 'None', '678-901-2345', NULL, 'CNA67890', 'INS67890', 'MP014', 'Active', '2022-04-20');  -- Supervised by MP014 (RN45678)

-- INSERT PATIENTS (AssignedDoctorId will be auto-assigned by stored procedure)
INSERT INTO Patient (patientId, Fname, Lname, `Medical History`, Diagnosis, Diet, Waivers, Address, Phone, ECname, ECcontact, Birthdate, Discharge, AdmissionDate) VALUES
('P001', 'John', 'Doe', 'Medical history details for John Doe.', 'Diagnosis details for John Doe.', 'Vegetarian, Gluten-Free', 'Waiver 1, Waiver 2', '123 Main St', '1234567890', 'Jane Doe', '9876543210', '1980-01-01', 0, '2024-01-05'),
('P002', 'Alice', 'Smith', 'Medical history details for Alice Smith.', 'Diagnosis details for Alice Smith.', 'Vegan, Low-Sodium', 'Waiver 3, Waiver 4', '456 Elm St', '2345678901', 'Bob Smith', '8765432109', '1990-02-02', 0, '2024-01-10'),
('P003', 'Bob', 'Johnson', 'Medical history details for Bob Johnson.', 'Diagnosis details for Bob Johnson.', 'Keto, High-Protein', 'Waiver 5, Waiver 6', '789 Oak St', '3456789012', 'Carol Johnson', '7654321098', '1975-03-03', 1, '2024-01-15'),
('P004', 'Carol', 'Williams', 'Medical history details for Carol Williams.', 'Diagnosis details for Carol Williams.', 'Paleo, Low-Carb', 'Waiver 7, Waiver 8', '101 Pine St', '4567890123', 'David Williams', '6543210987', '1985-04-04', 0, '2024-02-01'),
('P005', 'David', 'Brown', 'Medical history details for David Brown.', 'Diagnosis details for David Brown.', 'Mediterranean, Dairy-Free', 'Waiver 9, Waiver 10', '202 Maple St', '5678901234', 'Eve Brown', '5432109876', '1995-05-05', 1, '2024-02-10'),
('P006', 'Eve', 'Davis', 'Medical history details for Eve Davis.', 'Diagnosis details for Eve Davis.', 'Low-Fat, High-Fiber', 'Waiver 11, Waiver 12', '303 Birch St', '6789012345', 'Frank Davis', '4321098765', '1988-06-06', 0, '2024-03-01'),
('P007', 'Frank', 'Miller', 'Medical history details for Frank Miller.', 'Diagnosis details for Frank Miller.', 'Low-Carb, High-Protein', 'Waiver 13, Waiver 14', '404 Cedar St', '7890123456', 'Grace Miller', '3210987654', '1978-07-07', 1, '2024-03-15'),
('P008', 'Grace', 'Wilson', 'Medical history details for Grace Wilson.', 'Diagnosis details for Grace Wilson.', 'Vegetarian, Low-Sodium', 'Waiver 15, Waiver 16', '505 Spruce St', '8901234567', 'Henry Wilson', '2109876543', '1992-08-08', 0, '2024-04-01'),
('P009', 'Henry', 'Moore', 'Medical history details for Henry Moore.', 'Diagnosis details for Henry Moore.', 'Vegan, Gluten-Free', 'Waiver 17, Waiver 18', '606 Willow St', '9012345678', 'Ivy Moore', '1098765432', '1982-09-09', 1, '2024-04-20'),
('P010', 'Ivy', 'Taylor', 'Medical history details for Ivy Taylor.', 'Diagnosis details for Ivy Taylor.', 'Paleo, Dairy-Free', 'Waiver 19, Waiver 20', '707 Aspen St', '1234567890', 'Jack Taylor', '0987654321', '1999-10-10', 0, '2024-05-01');

-- INSERT DRUGS (with stock levels)
INSERT INTO Drugs (DrugsId, DrugsName, Dosage, Generics, DrugsAllergensl, StockLevel, MinimumStock) VALUES
('dr3401', 'Aspirin', '500mg', 'Acetylsalicylic Acid', 'None', 500, 50),
('dr3402', 'Ibuprofen', '200mg', 'Ibuprofen', 'None', 300, 40),
('dr3403', 'Amoxicillin', '250mg', 'Amoxicillin', 'Penicillin', 200, 30),
('dr3404', 'Lisinopril', '10mg', 'Lisinopril', 'None', 250, 35),
('dr3405', 'Metformin', '500mg', 'Metformin', 'None', 400, 50),
('dr3406', 'Cetirizine', '10mg', 'Cetirizine', 'None', 150, 25),
('dr3407', 'Atorvastatin', '20mg', 'Atorvastatin', 'None', 180, 30),
('dr3408', 'Omeprazole', '20mg', 'Omeprazole', 'None', 220, 35),
('dr3409', 'Albuterol', '90mcg', 'Albuterol', 'None', 100, 20),
('dr3410', 'Hydrochlorothiazide', '25mg', 'Hydrochlorothiazide', 'Sulfa Drugs', 280, 40),
('dr3411', 'Simvastatin', '20mg', 'Simvastatin', 'None', 190, 30),
('dr3412', 'Levothyroxine', '50mcg', 'Levothyroxine', 'None', 320, 45),
('dr3413', 'Gabapentin', '300mg', 'Gabapentin', 'None', 140, 25),
('dr3414', 'Prednisone', '10mg', 'Prednisone', 'None', 110, 20),
('dr3415', 'Warfarin', '5mg', 'Warfarin', 'None', 95, 20);

-- INSERT TESTS (with costs)
INSERT INTO Tests (TestsId, TestName, `Testing Department`, `Test requirements`, Cost, Duration) VALUES
('T2301', 'Complete Blood Count', 'Laboratory', 'Fasting required for 8 hours', 45.00, 15),
('T2302', 'Chest X-Ray', 'Radiology', 'Remove all metal objects', 120.00, 20),
('T2303', 'Electrocardiogram (ECG)', 'Cardiology', 'Avoid caffeine 24 hours before test', 85.00, 30),
('T2304', 'Urinalysis', 'Laboratory', 'Collect midstream urine sample', 25.00, 10),
('T2305', 'MRI Scan', 'Radiology', 'No metal implants, fasting for 4 hours', 850.00, 60),
('T2306', 'Blood Glucose Test', 'Screening', 'Fasting required for 8 hours', 20.00, 10),
('T2307', 'Liver Function Test', 'Laboratory', 'Avoid alcohol 24 hours before test', 65.00, 20),
('T2308', 'Mammogram', 'Radiology', 'Do not use deodorant on the day of the test', 180.00, 30),
('T2309', 'Thyroid Function Test', 'Laboratory', 'No special preparation required', 75.00, 15),
('T2310', 'Stress Test', 'Cardiology', 'Wear comfortable clothing and shoes', 250.00, 45),
('T2311', 'Pap Smear', 'Screening', 'Avoid intercourse 24 hours before test', 95.00, 20),
('T2312', 'CT Scan', 'Radiology', 'Fasting required for 4 hours, no metal objects', 650.00, 45),
('T2313', 'Hemoglobin A1c', 'Laboratory', 'No special preparation required', 40.00, 15),
('T2314', 'Bone Density Test', 'Radiology', 'Avoid calcium supplements 24 hours before test', 150.00, 25),
('T2315', 'Prostate-Specific Antigen (PSA) Test', 'Screening', 'Avoid ejaculation 48 hours before test', 55.00, 15);

-- INSERT REPORTS
INSERT INTO Report (reportId, reportType, report) VALUES
('RI001', 'SR', 'This is a situation report detailing the current status of the project.'),
('RI002', 'SUM', 'This is a summary report summarizing the key findings and outcomes.'),
('RI003', 'SR', 'This is a situation report detailing the current status of the project.'),
('RI004', 'SUM', 'This is a summary report summarizing the key findings and outcomes.'),
('RI005', 'SR', 'This is a situation report detailing the current status of the project.'),
('RI006', 'SUM', 'This is a summary report summarizing the key findings and outcomes.'),
('RI007', 'SR', 'This is a situation report detailing the current status of the project.'),
('RI008', 'SUM', 'This is a summary report summarizing the key findings and outcomes.'),
('RI009', 'SR', 'This is a situation report detailing the current status of the project.'),
('RI010', 'SUM', 'This is a summary report summarizing the key findings and outcomes.');

-- We'll add prescriptions, situation reports, and test schedules AFTER we allocate doctors

-- ==================== CONTINUED IN NEXT FILE ====================
-- This file contains: Tables, initial data
-- Next file will have: Triggers, procedures, views, and automation
-- ==================== HEALTHHUB MANAGER - PART 2: AUTOMATION ====================
-- Triggers, Stored Procedures, Views, and Intelligent Patient Allocation

USE healthhub_db;

-- Temporarily disable safe update mode for this script
-- (Re-enabled at end of file)
SET SQL_SAFE_UPDATES = 0;

-- ==================== PART 4: STORED PROCEDURES ====================

-- PROCEDURE 1: Allocate Patients to Doctors Evenly
-- This automatically assigns patients to doctors with the LOWEST patient load

DELIMITER $$

CREATE PROCEDURE AllocatePatientToDoctor(
    IN p_patientId VARCHAR(10)
)
BEGIN
    DECLARE v_medicalPersonnelId VARCHAR(10);
    
    -- Find doctor (MedicalPersonnelId) with LOWEST patient load who is ACTIVE
    SELECT MedicalPersonnelId INTO v_medicalPersonnelId
    FROM MedicalPersonnel
    WHERE DoctorId IS NOT NULL 
      AND Status = 'Active'
      AND Specialty IN ('Family Medicine', 'Internal Medicine', 'Pediatrics', 'Surgery', 'Psychiatry')
    ORDER BY PatientLoad ASC, RAND()  -- Lowest load first, random if tied
    LIMIT 1;
    
    -- Assign patient to this doctor (store MedicalPersonnelId)
    UPDATE Patient 
    SET AssignedDoctorId = v_medicalPersonnelId 
    WHERE patientId = p_patientId;
    
    -- Increment doctor's patient load
    UPDATE MedicalPersonnel 
    SET PatientLoad = PatientLoad + 1 
    WHERE MedicalPersonnelId = v_medicalPersonnelId;
    
    -- Log the allocation
    INSERT INTO AuditLog (TableName, RecordId, Action, ChangedBy, NewValue)
    VALUES ('Patient', p_patientId, 'UPDATE', 'SYSTEM', 
            CONCAT('Allocated to doctor: ', v_medicalPersonnelId));
END$$

DELIMITER ;

-- PROCEDURE 2: Reallocate ALL Patients Evenly
-- Run this to rebalance the workload across all doctors

DELIMITER $$

CREATE PROCEDURE RebalanceAllPatients()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE p_id VARCHAR(10);
    
    -- Cursor to loop through all active patients
    DECLARE patient_cursor CURSOR FOR 
        SELECT patientId FROM Patient WHERE Discharge = 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    -- Reset all patient loads to 0
    UPDATE MedicalPersonnel SET PatientLoad = 0;
    
    -- Clear all patient assignments
    UPDATE Patient SET AssignedDoctorId = NULL WHERE Discharge = 0;
    
    -- Reallocate each patient
    OPEN patient_cursor;
    
    read_loop: LOOP
        FETCH patient_cursor INTO p_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL AllocatePatientToDoctor(p_id);
    END LOOP;
    
    CLOSE patient_cursor;
    
    -- Log the rebalancing
    INSERT INTO AuditLog (TableName, RecordId, Action, ChangedBy, NewValue)
    VALUES ('MedicalPersonnel', 'ALL', 'UPDATE', 'SYSTEM', 'Patient load rebalanced');
END$$

DELIMITER ;

-- PROCEDURE 3: Discharge Patient (with automatic doctor load update)

DELIMITER $$

CREATE PROCEDURE DischargePatient(
    IN p_patientId VARCHAR(10),
    IN p_dischargeDate DATE
)
BEGIN
    DECLARE v_medicalPersonnelId VARCHAR(10);
    
    -- Get patient's current doctor (MedicalPersonnelId)
    SELECT AssignedDoctorId INTO v_medicalPersonnelId
    FROM Patient
    WHERE patientId = p_patientId;
    
    -- Mark patient as discharged
    UPDATE Patient
    SET Discharge = 1,
        DischargeDate = p_dischargeDate
    WHERE patientId = p_patientId;
    
    -- Decrease doctor's patient load
    IF v_medicalPersonnelId IS NOT NULL THEN
        UPDATE MedicalPersonnel
        SET PatientLoad = GREATEST(0, PatientLoad - 1)  -- Don't go negative
        WHERE MedicalPersonnelId = v_medicalPersonnelId;
    END IF;
    
    -- Log the discharge
    INSERT INTO AuditLog (TableName, RecordId, Action, ChangedBy, NewValue)
    VALUES ('Patient', p_patientId, 'UPDATE', 'SYSTEM', 
            CONCAT('Patient discharged on ', p_dischargeDate));
END$$

DELIMITER ;

-- PROCEDURE 4: Request Supervisor Approval

DELIMITER $$

CREATE PROCEDURE RequestSupervisorApproval(
    IN p_patientId VARCHAR(10),
    IN p_doctorId VARCHAR(10),               -- MedicalPersonnelId of doctor requesting
    IN p_category ENUM('Treatment', 'Prescription', 'Procedure', 'Discharge'),
    IN p_comments VARCHAR(255)
)
BEGIN
    DECLARE v_supervisorId VARCHAR(10);
    
    -- Find the doctor's supervisor (look up by MedicalPersonnelId)
    SELECT mp.Supervisor INTO v_supervisorId
    FROM MedicalPersonnel mp
    WHERE mp.MedicalPersonnelId = p_doctorId;
    
    -- Create approval request
    INSERT INTO SupervisorSignOff 
    (PatientId, SupervisorId, DoctorId, ApprovalStatus, Comments, Category)
    VALUES 
    (p_patientId, v_supervisorId, p_doctorId, 'Pending', p_comments, p_category);
    
    -- Log the request
    INSERT INTO AuditLog (TableName, RecordId, Action, ChangedBy, NewValue)
    VALUES ('SupervisorSignOff', LAST_INSERT_ID(), 'INSERT', p_doctorId, 
            CONCAT('Approval requested from ', v_supervisorId));
END$$

DELIMITER ;

-- ==================== PART 5: TRIGGERS (AUTOMATIC ACTIONS) ====================

-- TRIGGER 1: Auto-allocate new patients

DELIMITER $$

CREATE TRIGGER after_patient_insert
AFTER INSERT ON Patient
FOR EACH ROW
BEGIN
    -- If patient doesn't have a doctor yet, allocate one
    IF NEW.AssignedDoctorId IS NULL AND NEW.Discharge = 0 THEN
        CALL AllocatePatientToDoctor(NEW.patientId);
    END IF;
END$$

DELIMITER ;

-- TRIGGER 2: Track patient updates (audit trail)

DELIMITER $$

CREATE TRIGGER after_patient_update
AFTER UPDATE ON Patient
FOR EACH ROW
BEGIN
    -- Log any changes to patient records
    IF OLD.AssignedDoctorId != NEW.AssignedDoctorId OR OLD.Discharge != NEW.Discharge THEN
        INSERT INTO AuditLog (TableName, RecordId, Action, OldValue, NewValue)
        VALUES ('Patient', NEW.patientId, 'UPDATE',
                CONCAT('Doctor:', OLD.AssignedDoctorId, ', Discharge:', OLD.Discharge),
                CONCAT('Doctor:', NEW.AssignedDoctorId, ', Discharge:', NEW.Discharge));
    END IF;
END$$

DELIMITER ;

-- TRIGGER 3: Alert when drug stock is low

DELIMITER $$

CREATE TRIGGER check_drug_stock
AFTER UPDATE ON Drugs
FOR EACH ROW
BEGIN
    -- Log if stock drops below minimum
    IF NEW.StockLevel < NEW.MinimumStock THEN
        INSERT INTO AuditLog (TableName, RecordId, Action, NewValue)
        VALUES ('Drugs', NEW.DrugsId, 'UPDATE',
                CONCAT('LOW STOCK ALERT: ', NEW.DrugsName, ' - ', 
                       NEW.StockLevel, ' remaining'));
    END IF;
END$$

DELIMITER ;

-- TRIGGER 4: Decrement drug stock on prescription

DELIMITER $$

CREATE TRIGGER reduce_drug_stock
AFTER INSERT ON Prescriptions
FOR EACH ROW
BEGIN
    -- Reduce drug stock by 30 (assuming 30-day supply)
    UPDATE Drugs
    SET StockLevel = GREATEST(0, StockLevel - 30)
    WHERE DrugsId = NEW.DrugID;
END$$

DELIMITER ;

-- TRIGGER 5: Alert when refill is due soon

DELIMITER $$

CREATE TRIGGER check_refill_date
AFTER INSERT ON Prescriptions
FOR EACH ROW
BEGIN
    -- Log if refill date is within 7 days
    IF DATEDIFF(NEW.RefillDate, CURDATE()) <= 7 THEN
        INSERT INTO AuditLog (TableName, RecordId, Action, NewValue)
        VALUES ('Prescriptions', NEW.PrescriptionsId, 'INSERT',
                CONCAT('REFILL DUE SOON: Patient ', NEW.PatientID, 
                       ' - Refill date: ', NEW.RefillDate));
    END IF;
END$$

DELIMITER ;

-- ==================== PART 6: VIEWS (EASY REPORTING) ====================

-- VIEW 1: Doctor Workload Summary
CREATE VIEW vw_DoctorWorkload AS
SELECT 
    mp.DoctorId,
    CONCAT(mp.Fname, ' ', mp.Lname) AS DoctorName,
    mp.Specialty,
    mp.PatientLoad,
    mp.Status,
    CONCAT(sup.Fname, ' ', sup.Lname) AS SupervisorName
FROM MedicalPersonnel mp
LEFT JOIN MedicalPersonnel sup ON mp.Supervisor = sup.MedicalPersonnelId
WHERE mp.DoctorId IS NOT NULL
ORDER BY mp.PatientLoad DESC;

-- VIEW 2: Active Patients with Doctor Info
CREATE VIEW vw_ActivePatients AS
SELECT 
    p.patientId,
    CONCAT(p.Fname, ' ', p.Lname) AS PatientName,
    p.Birthdate,
    TIMESTAMPDIFF(YEAR, p.Birthdate, CURDATE()) AS Age,
    p.Phone,
    p.AdmissionDate,
    DATEDIFF(CURDATE(), p.AdmissionDate) AS DaysInCare,
    CONCAT(mp.Fname, ' ', mp.Lname) AS DoctorName,
    mp.Specialty AS DoctorSpecialty
FROM Patient p
LEFT JOIN MedicalPersonnel mp ON p.AssignedDoctorId = mp.MedicalPersonnelId
WHERE p.Discharge = 0
ORDER BY p.AdmissionDate;

-- VIEW 3: Pending Supervisor Approvals
CREATE VIEW vw_PendingApprovals AS
SELECT 
    so.SignOffId,
    so.Category,
    CONCAT(p.Fname, ' ', p.Lname) AS PatientName,
    CONCAT(doc.Fname, ' ', doc.Lname) AS RequestingDoctor,
    CONCAT(sup.Fname, ' ', sup.Lname) AS Supervisor,
    so.Comments,
    so.SignOffDate,
    DATEDIFF(CURDATE(), so.SignOffDate) AS DaysPending
FROM SupervisorSignOff so
JOIN Patient p ON so.PatientId = p.patientId
JOIN MedicalPersonnel doc ON so.DoctorId = doc.MedicalPersonnelId
JOIN MedicalPersonnel sup ON so.SupervisorId = sup.MedicalPersonnelId
WHERE so.ApprovalStatus = 'Pending'
ORDER BY so.SignOffDate;

-- VIEW 4: Low Stock Drugs
CREATE VIEW vw_LowStockDrugs AS
SELECT 
    DrugsId,
    DrugsName,
    Dosage,
    StockLevel,
    MinimumStock,
    (MinimumStock - StockLevel) AS UnitsNeeded,
    CASE 
        WHEN StockLevel <= MinimumStock * 0.5 THEN 'CRITICAL'
        WHEN StockLevel <= MinimumStock THEN 'LOW'
        ELSE 'OK'
    END AS StockStatus
FROM Drugs
WHERE StockLevel <= MinimumStock
ORDER BY StockLevel ASC;

-- VIEW 5: Upcoming Refills (Next 7 Days)
CREATE VIEW vw_UpcomingRefills AS
SELECT 
    pr.PrescriptionsId,
    CONCAT(p.Fname, ' ', p.Lname) AS PatientName,
    p.Phone AS PatientPhone,
    d.DrugsName,
    d.Dosage,
    pr.RefillDate,
    DATEDIFF(pr.RefillDate, CURDATE()) AS DaysUntilRefill,
    pr.RefillsRemaining,
    CONCAT(mp.Fname, ' ', mp.Lname) AS PrescribingDoctor
FROM Prescriptions pr
JOIN Patient p ON pr.PatientID = p.patientId
JOIN Drugs d ON pr.DrugID = d.DrugsId
JOIN MedicalPersonnel mp ON pr.DoctorID = mp.MedicalPersonnelId
WHERE pr.RefillDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND pr.Status = 'Active'
  AND pr.RefillsRemaining > 0
ORDER BY pr.RefillDate;

-- VIEW 6: Medical Personnel Hierarchy
CREATE VIEW vw_StaffHierarchy AS
SELECT 
    mp.MedicalPersonnelId,
    CONCAT(mp.Fname, ' ', mp.Lname) AS StaffName,
    mp.Specialty,
    mp.License,
    CASE 
        WHEN mp.DoctorId IS NOT NULL THEN 'Doctor'
        WHEN mp.License LIKE 'RN%' THEN 'Registered Nurse'
        WHEN mp.License LIKE 'LPN%' THEN 'Licensed Practical Nurse'
        WHEN mp.License LIKE 'CNA%' THEN 'Certified Nursing Assistant'
        ELSE 'Other'
    END AS Role,
    CONCAT(sup.Fname, ' ', sup.Lname) AS SupervisorName,
    mp.Status
FROM MedicalPersonnel mp
LEFT JOIN MedicalPersonnel sup ON mp.Supervisor = sup.MedicalPersonnelId
ORDER BY Role, mp.Lname;

-- ==================== PART 7: NOW RUN THE ALLOCATION! ====================

-- Allocate all patients to doctors evenly
CALL RebalanceAllPatients();

-- ==================== PART 8: INSERT REMAINING DATA ====================

-- Now that doctors are assigned, add prescriptions
INSERT INTO Prescriptions (PrescriptionsId, PatientID, DoctorID, DrugID, Prescription, RefillDate, Date, RefillsRemaining, Status) VALUES
('PR001', 'P001', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P001'), 'dr3401', 'Take one tablet daily', '2024-12-20', '2024-12-10', 3, 'Active'),
('PR002', 'P002', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P002'), 'dr3402', 'Take two tablets daily', '2024-12-21', '2024-12-11', 2, 'Active'),
('PR003', 'P003', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P003'), 'dr3403', 'Take one capsule every 8 hours', '2024-12-22', '2024-12-12', 1, 'Completed'),
('PR004', 'P004', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P004'), 'dr3404', 'Take one tablet daily', '2024-12-23', '2024-12-13', 3, 'Active'),
('PR005', 'P005', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P005'), 'dr3405', 'Take one tablet with meals', '2024-12-24', '2024-12-14', 0, 'Completed'),
('PR006', 'P006', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P006'), 'dr3406', 'Take one tablet daily', '2024-12-25', '2024-12-15', 3, 'Active'),
('PR007', 'P007', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P007'), 'dr3407', 'Take one tablet daily', '2024-12-26', '2024-12-16', 1, 'Completed'),
('PR008', 'P008', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P008'), 'dr3408', 'Take one capsule before meals', '2024-12-27', '2024-12-17', 3, 'Active'),
('PR009', 'P009', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P009'), 'dr3409', 'Use as needed for wheezing', '2024-12-28', '2024-12-18', 2, 'Completed'),
('PR010', 'P010', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P010'), 'dr3410', 'Take one tablet daily', '2024-12-29', '2024-12-19', 3, 'Active');

-- Insert situation reports
INSERT INTO Writes (SitRepId, Reportid, Patient, `Situation Report`, Date, MedicalPersonnel, Severity) VALUES
('SR001', 'RI001', 'P001', 'Patient John Doe is recovering well from surgery. No complications observed.', '2024-01-15', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P001'), 'Routine'),
('SR002', 'RI002', 'P002', 'Patient Alice Smith has shown improvement in blood pressure levels.', '2024-02-20', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P002'), 'Important'),
('SR003', 'RI003', 'P003', 'Patient Bob Johnson\'s keto diet is effectively managing his diabetes.', '2024-03-10', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P003'), 'Routine'),
('SR004', 'RI004', 'P004', 'Patient Carol Williams is responding well to the paleo diet.', '2024-04-05', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P004'), 'Routine'),
('SR005', 'RI005', 'P005', 'Patient David Brown\'s Mediterranean diet is improving his cholesterol levels.', '2024-05-12', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P005'), 'Important'),
('SR006', 'RI006', 'P006', 'Patient Eve Davis has increased fiber intake, aiding digestion.', '2024-06-18', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P006'), 'Routine'),
('SR007', 'RI007', 'P007', 'Patient Frank Miller\'s high-protein diet is supporting muscle gain.', '2024-07-22', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P007'), 'Routine'),
('SR008', 'RI008', 'P008', 'Patient Grace Wilson\'s vegetarian diet is maintaining her sodium levels.', '2024-08-30', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P008'), 'Important'),
('SR009', 'RI009', 'P009', 'Patient Henry Moore\'s vegan diet is managing his gluten intolerance.', '2024-09-14', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P009'), 'Routine'),
('SR010', 'RI010', 'P010', 'Patient Ivy Taylor\'s paleo diet is helping with dairy intolerance.', '2024-10-25', (SELECT AssignedDoctorId FROM Patient WHERE patientId = 'P010'), 'Routine');

-- Insert test schedules
INSERT INTO `Tested for` (SchedTest, Patient, TestId, `Scheduled on`, Date, Status) VALUES
('ST001', 'P001', 'T2301', '2024-01-10', '2024-01-15', 'Completed'),
('ST002', 'P002', 'T2302', '2024-02-05', '2024-02-10', 'Completed'),
('ST003', 'P003', 'T2303', '2024-03-01', '2024-03-05', 'Completed'),
('ST004', 'P004', 'T2304', '2024-04-10', '2024-04-15', 'Scheduled'),
('ST005', 'P005', 'T2305', '2024-05-20', '2024-05-25', 'Completed'),
('ST006', 'P006', 'T2306', '2024-06-15', '2024-06-20', 'Scheduled'),
('ST007', 'P007', 'T2307', '2024-07-10', '2024-07-15', 'Completed'),
('ST008', 'P008', 'T2308', '2024-08-05', '2024-08-10', 'Scheduled'),
('ST009', 'P009', 'T2309', '2024-09-01', '2024-09-05', 'Completed'),
('ST010', 'P010', 'T2310', '2024-10-10', '2024-10-15', 'Scheduled'),
('ST011', 'P001', 'T2311', '2024-11-05', '2024-11-10', 'Scheduled'),
('ST012', 'P002', 'T2312', '2024-12-01', '2024-12-05', 'Scheduled'),
('ST013', 'P003', 'T2313', '2024-01-15', '2024-01-20', 'Completed'),
('ST014', 'P004', 'T2314', '2024-02-10', '2024-02-15', 'Scheduled'),
('ST015', 'P005', 'T2315', '2024-03-05', '2024-03-10', 'Completed');

-- Create some sample supervisor approvals (using MedicalPersonnelId)
CALL RequestSupervisorApproval('P001', 'MP001', 'Treatment', 'Request approval for experimental treatment');
CALL RequestSupervisorApproval('P004', 'MP004', 'Procedure', 'Request approval for surgical procedure');
CALL RequestSupervisorApproval('P006', 'MP006', 'Discharge', 'Request approval for early discharge');

-- ==================== VERIFICATION ====================

SELECT ' ENHANCED DATABASE SETUP COMPLETE!' as Status;

-- Show doctor workload
SELECT 'DOCTOR WORKLOAD:' as Info;
SELECT * FROM vw_DoctorWorkload;

-- Show active patients
SELECT 'ACTIVE PATIENTS:' as Info;
SELECT * FROM vw_ActivePatients;

-- Show pending approvals
SELECT 'PENDING APPROVALS:' as Info;
SELECT * FROM vw_PendingApprovals;

-- Show low stock drugs
SELECT 'LOW STOCK ALERTS:' as Info;
SELECT * FROM vw_LowStockDrugs;

-- Show upcoming refills
SELECT 'UPCOMING REFILLS:' as Info;
SELECT * FROM vw_UpcomingRefills;

-- Show audit log sample
SELECT 'RECENT AUDIT LOG:' as Info;
SELECT * FROM AuditLog ORDER BY ChangeDate DESC LIMIT 10;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
-- ==================== ADD AUTHENTICATION TO HEALTHHUB ====================
-- This adds a Users table with demo accounts for authentication

USE healthhub_db;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    MedicalPersonnelId VARCHAR(10),
    role ENUM('Doctor', 'Nurse', 'Admin') NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP NULL,
    FOREIGN KEY (MedicalPersonnelId) REFERENCES MedicalPersonnel(MedicalPersonnelId),
    INDEX idx_username (username),
    INDEX idx_role (role)
) COMMENT='User accounts for authentication';

-- Insert demo accounts (passwords are plain text for demo - in production would be hashed!)
-- Password for all accounts: "password123"

-- Admin account
INSERT INTO Users (username, password, MedicalPersonnelId, role) VALUES
('admin', 'password123', NULL, 'Admin');

-- Doctor accounts (one for each doctor)
INSERT INTO Users (username, password, MedicalPersonnelId, role) VALUES
('doc01', 'password123', 'MP001', 'Doctor'),
('doc02', 'password123', 'MP002', 'Doctor'),
('doc03', 'password123', 'MP003', 'Doctor'),
('doc04', 'password123', 'MP004', 'Doctor'),
('doc05', 'password123', 'MP005', 'Doctor'),
('doc06', 'password123', 'MP006', 'Doctor'),
('doc07', 'password123', 'MP007', 'Doctor'),
('doc08', 'password123', 'MP008', 'Doctor'),
('doc09', 'password123', 'MP009', 'Doctor'),
('doc10', 'password123', 'MP010', 'Doctor');

-- Nurse accounts
INSERT INTO Users (username, password, MedicalPersonnelId, role) VALUES
('nurse01', 'password123', 'MP011', 'Nurse'),
('nurse02', 'password123', 'MP012', 'Nurse'),
('nurse03', 'password123', 'MP013', 'Nurse'),
('nurse04', 'password123', 'MP014', 'Nurse'),
('nurse05', 'password123', 'MP015', 'Nurse'),
('nurse06', 'password123', 'MP016', 'Nurse');

-- Verify
SELECT 
    u.userId,
    u.username,
    u.role,
    CONCAT(mp.Fname, ' ', mp.Lname) AS Name,
    mp.Specialty
FROM Users u
LEFT JOIN MedicalPersonnel mp ON u.MedicalPersonnelId = mp.MedicalPersonnelId
ORDER BY u.role, u.username;

SELECT ' Users table created with 17 demo accounts!' as Status;
SELECT 'Login with: doc01/password123 (Doctor) or nurse01/password123 (Nurse)' as Info;
