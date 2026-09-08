-- Demo seed for the PoC. Names are placeholders, not real people.
INSERT INTO users (id, email, name, role, staff_id) VALUES
 ('u-ed','ed@starsorbit.org','Executive Director','ED',NULL),
 ('u-od','od@starsorbit.org','Operations Director','OD',NULL),
 ('u-fm','fm@starsorbit.org','Finance Manager','FM',NULL),
 ('u-pm','pm@starsorbit.org','Project Manager Ninewa','PM','S-004'),
 ('u-me','me@starsorbit.org','M&E Officer','ME','S-001'),
 ('u-hr','hr@starsorbit.org','HR Officer','HR',NULL),
 ('u-staff','field@starsorbit.org','Field Officer','STAFF','S-002');

INSERT INTO projects (code, name, donor, start_date, end_date, currency, flexibility_pct) VALUES
 ('UNHCR-PPA-2026','Multipurpose cash assistance, Ninewa','UNHCR','2026-01-01','2026-12-31','USD',0.10),
 ('UNICEF-PCA-2026','Teacher psychosocial support training, Dohuk','UNICEF','2026-04-01','2027-03-31','USD',0.15),
 ('CORE','Core and unrestricted','SOC','2026-01-01','2026-12-31','USD',0.10);

INSERT INTO staff (id, name, position, grade, duty_station, country, contract_type, start_date, end_date, probation_end, renewal_count, line_manager, salary, currency, notice_days, status) VALUES
 ('S-001','Staff Member A','M&E Officer','C','Erbil','Iraq','one-year','2026-02-01','2027-01-31','2026-04-30',0,'S-004',1800,'USD',30,'active'),
 ('S-002','Staff Member B','Field Officer','B','Mosul','Iraq','month-to-month','2026-04-01','2026-09-30','2026-06-30',5,'S-004',1100,'USD',15,'active'),
 ('S-003','Staff Member C','Finance Assistant','B','Amman','Jordan','one-year','2025-10-01','2026-09-30','2025-12-31',1,'FM',900,'JOD',30,'active'),
 ('S-004','Staff Member D','Project Manager','D','Erbil','Iraq','one-year','2026-01-01','2026-12-31','2026-03-31',0,'OD',3000,'USD',30,'active'),
 ('S-005','Staff Member E','Field Officer','B','Dohuk','Iraq','one-year','2026-05-01','2027-04-30','2026-07-31',0,'S-004',1100,'USD',30,'active'),
 ('S-006','Consultant F','PSS Trainer','','Dohuk','Iraq','consultant','2026-06-01','2026-11-30',NULL,0,'S-004',250,'USD',7,'active');

INSERT INTO staff_allocations (staff_id, project_code, pct) VALUES
 ('S-001','UNHCR-PPA-2026',0.6),('S-001','UNICEF-PCA-2026',0.4),
 ('S-002','UNHCR-PPA-2026',1.0),
 ('S-003','CORE',1.0),
 ('S-004','UNHCR-PPA-2026',0.6),('S-004','UNICEF-PCA-2026',0.4),
 ('S-005','UNICEF-PCA-2026',1.0),
 ('S-006','UNICEF-PCA-2026',1.0);

INSERT INTO contracts (id, type, party, project_code, value_usd, start_date, end_date, notice_days, renewal_count, signatory, status, staff_id) VALUES
 ('CT-2026-031','employment','Staff Member A','UNHCR-PPA-2026',21600,'2026-02-01','2027-01-31',30,0,'OD','active','S-001'),
 ('CT-2026-047','employment','Staff Member B','UNHCR-PPA-2026',6600,'2026-04-01','2026-09-30',15,5,'OD','active','S-002'),
 ('CT-2025-118','employment','Staff Member C','CORE',15300,'2025-10-01','2026-09-30',30,1,'OD','active','S-003'),
 ('CT-2026-052','supplier','Cash delivery agent X','UNHCR-PPA-2026',2400,'2026-03-01','2026-12-31',30,0,'ED','active',NULL),
 ('CT-2026-060','donor','UNICEF PCA','UNICEF-PCA-2026',180000,'2026-04-01','2027-03-31',60,0,'ED','active',NULL),
 ('CT-2026-071','consultant','Consultant F','UNICEF-PCA-2026',12000,'2026-06-01','2026-11-30',7,0,'OD','active','S-006');

INSERT INTO indicators (id, project_code, level, definition, unit, disaggregation, baseline, target, frequency, source, responsible) VALUES
 ('IND-01','UNHCR-PPA-2026','Output 1','Number of IDP households receiving multipurpose cash assistance','households','sex of HoH, governorate',0,1200,'quarterly','Distribution lists','M&E Officer'),
 ('IND-02','UNHCR-PPA-2026','Outcome 1','% of assisted households reporting ability to meet basic needs (PDM)','%','sex of HoH',31,70,'quarterly','Kobo PDM survey','M&E Officer'),
 ('IND-03','UNHCR-PPA-2026','Output 2','Number of post-distribution monitoring surveys completed','surveys','governorate',0,360,'quarterly','Kobo','M&E Officer'),
 ('IND-04','UNICEF-PCA-2026','Output 1','Number of teachers completing psychosocial support training','persons','sex, district',0,150,'quarterly','Attendance sheets','M&E Officer'),
 ('IND-05','UNICEF-PCA-2026','Outcome 1','% of trained teachers demonstrating improved PSS knowledge (pre/post test)','%','sex',0,75,'quarterly','Pre/post tests','M&E Officer');

INSERT INTO indicator_values (indicator_id, period, value, verified_by, verified_at) VALUES
 ('IND-01','2026-Q1',280,'M&E Officer','2026-04-08'),('IND-01','2026-Q2',310,'M&E Officer','2026-07-09'),
 ('IND-02','2026-Q1',48,'M&E Officer','2026-04-08'),('IND-02','2026-Q2',55,'M&E Officer','2026-07-09'),
 ('IND-03','2026-Q1',90,'M&E Officer','2026-04-08'),('IND-03','2026-Q2',102,'M&E Officer','2026-07-09'),
 ('IND-04','2026-Q2',40,'M&E Officer','2026-07-09'),('IND-04','2026-Q3',62,NULL,NULL),
 ('IND-05','2026-Q2',61,'M&E Officer','2026-07-09');

INSERT INTO translations (id, project_code, source_ref, arabic_text, english_text, translator, reviewer, status) VALUES
 ('TR-0041','UNHCR-PPA-2026','FGD-W-Mosul-02 / REC-0231','في ذلك الأسبوع لم يكن لدينا ما نطعمه للأطفال. المساعدة النقدية ساعدتنا نشتري الطحين والدواء.','That week we had nothing to feed the children. The cash assistance helped us buy flour and medicine.','Contracted translator A','M&E Officer','reviewed'),
 ('TR-0042','UNHCR-PPA-2026','KII-Mukhtar-Sinjar-01 / REC-0240','المختار قال إن النازحين العائدين يحتاجون بطاقة السكن قبل التسجيل في القضاء.','The mayor said that the refugees who came back need a housing card before registering in the province.','Contracted translator B',NULL,'translated'),
 ('TR-0043','UNICEF-PCA-2026','Teacher-story-Dohuk-03','بعد التدريب صرت أعرف كيف أتعامل مع الطالب اللي يمر بضغط نفسي بدون ما أحرجه قدام زملائه.','After the training I know how to deal with a student going through psychological pressure without embarrassing him in front of his classmates.','Field Officer',NULL,'translated'),
 ('TR-0044','UNICEF-PCA-2026','FGD-Teachers-Dohuk-01','نحتاج مواد إضافية باللغة الكردية.',NULL,NULL,NULL,'draft');

INSERT INTO glossary (arabic, transliteration, english, do_not_use, note, domain) VALUES
 ('نازح','nazih','internally displaced person (IDP)','refugee, displaced','Iraqis displaced inside Iraq','M&E'),
 ('عائد','a''id','returnee','returned person','Returned to area of origin','M&E'),
 ('المجتمع المضيف','al-mujtama'' al-mudif','host community','locals','','M&E'),
 ('محافظة','muhafaza','governorate','province','Iraq first-level admin unit','M&E'),
 ('قضاء','qadha','district','county','Iraq second-level admin unit','M&E'),
 ('ناحية','nahiya','sub-district','township','','M&E'),
 ('مختار','mukhtar','mukhtar (community leader)','mayor, chief','Transliterate with gloss on first use','M&E'),
 ('بطاقة السكن','bitaqat al-sakan','residency card','housing card','Iraqi proof of residence','Protection'),
 ('البطاقة التموينية','al-bitaqa al-tamwiniya','PDS card','food card','Public Distribution System ration card','M&E'),
 ('المساعدات النقدية','al-musa''adat al-naqdiya','cash assistance','cash aid','Specify modality','Finance'),
 ('أشخاص ذوو الإعاقة','ashkhas dhawu al-i''aqa','persons with disabilities','disabled','Person-first language','Protection'),
 ('الحماية','al-himaya','protection','safety','Humanitarian sense','Protection'),
 ('الإحالة','al-ihala','referral','transfer','','Protection'),
 ('فترة الإشعار','fatrat al-ish''ar','notice period','warning period','','HR'),
 ('فترة التجربة','fatrat al-tajriba','probation period','trial period','','HR'),
 ('بدل المعيشة اليومي','badal al-ma''isha al-yawmi','per diem','daily allowance','','Finance'),
 ('سلفة','sulfa','cash advance','loan','','Finance'),
 ('عرض سعر','''ard si''r','quotation','price offer','','Logistics'),
 ('أمر شراء','amr shira''','purchase order (PO)','buying order','','Logistics');

INSERT INTO budget_lines (id, project_code, code, category, description, approved_usd) VALUES
 ('BL-U-11','UNHCR-PPA-2026','1.1','Personnel','Project Manager (60%)',21600),
 ('BL-U-12','UNHCR-PPA-2026','1.2','Personnel','M&E Officer (60%)',12960),
 ('BL-U-13','UNHCR-PPA-2026','1.3','Personnel','Field Officers',26400),
 ('BL-U-21','UNHCR-PPA-2026','2.1','Programme','Multipurpose cash transfers',320000),
 ('BL-U-22','UNHCR-PPA-2026','2.2','Programme','Post-distribution monitoring',4000),
 ('BL-U-23','UNHCR-PPA-2026','2.3','Programme','Cash delivery service fees',2400),
 ('BL-U-31','UNHCR-PPA-2026','3.1','Operations','Office rent Mosul (shared)',3840),
 ('BL-U-32','UNHCR-PPA-2026','3.2','Operations','Vehicle hire and fuel',7200),
 ('BL-U-33','UNHCR-PPA-2026','3.3','Operations','Translation services',1200),
 ('BL-U-41','UNHCR-PPA-2026','4.1','Indirect','Indirect cost recovery 7%',22000),
 ('BL-C-11','UNICEF-PCA-2026','1.1','Personnel','Project Manager (40%)',14400),
 ('BL-C-12','UNICEF-PCA-2026','1.2','Personnel','M&E Officer (40%)',8640),
 ('BL-C-13','UNICEF-PCA-2026','1.3','Personnel','Field Officer Dohuk',13200),
 ('BL-C-21','UNICEF-PCA-2026','2.1','Programme','PSS trainer consultancy',12000),
 ('BL-C-22','UNICEF-PCA-2026','2.2','Programme','Training venues and catering',27000),
 ('BL-C-23','UNICEF-PCA-2026','2.3','Programme','Training materials',6000),
 ('BL-C-31','UNICEF-PCA-2026','3.1','Operations','Transport and per diem',9000),
 ('BL-C-41','UNICEF-PCA-2026','4.1','Indirect','Indirect cost recovery 7%',6300),
 ('BL-X-01','CORE','1.0','Personnel','Finance Assistant',10800);

INSERT INTO expenses (id, project_code, budget_line_id, claimant, description, expense_date, amount, currency, fx_rate, usd_amount, receipt_ref, required_role, status, approver, submitted_at, decided_at) VALUES
 ('EXP-0101','UNHCR-PPA-2026','BL-U-21','Finance Manager','Cash transfer tranche 1 (280 HH)','2026-03-15',112000,'USD',1,112000,'BANK-0311','ED','paid','Executive Director','2026-03-10','2026-03-12'),
 ('EXP-0118','UNHCR-PPA-2026','BL-U-21','Finance Manager','Cash transfer tranche 2 (310 HH)','2026-06-12',124000,'USD',1,124000,'BANK-0612','ED','paid','Executive Director','2026-06-08','2026-06-10'),
 ('EXP-0120','UNHCR-PPA-2026','BL-U-11','Finance Manager','Payroll allocation Jan-Aug PM','2026-08-31',14400,'USD',1,14400,'PAY-08','OD','paid','Operations Director','2026-08-27','2026-08-28'),
 ('EXP-0121','UNHCR-PPA-2026','BL-U-12','Finance Manager','Payroll allocation Feb-Aug M&E','2026-08-31',7560,'USD',1,7560,'PAY-08','OD','paid','Operations Director','2026-08-27','2026-08-28'),
 ('EXP-0122','UNHCR-PPA-2026','BL-U-13','Finance Manager','Payroll allocation Apr-Aug field','2026-08-31',5500,'USD',1,5500,'PAY-08','OD','paid','Operations Director','2026-08-27','2026-08-28'),
 ('EXP-0130','UNHCR-PPA-2026','BL-U-32','Staff Member B','Vehicle hire Mosul-Sinjar PDM round 2','2026-09-01',180000,'IQD',0.00076,136.8,'R-01','PM','submitted',NULL,'2026-09-05',NULL),
 ('EXP-0131','UNHCR-PPA-2026','BL-U-22','Staff Member B','Enumerator daily rates PDM round 2 (12 days)','2026-09-03',300,'USD',1,300,'R-02','PM','submitted',NULL,'2026-09-05',NULL),
 ('EXP-0132','UNHCR-PPA-2026','BL-U-32','Finance Manager','Vehicle hire Jan-Aug','2026-08-31',4900,'USD',1,4900,'INV-0834','FM','paid','Finance Manager','2026-08-30','2026-08-31'),
 ('EXP-0133','UNHCR-PPA-2026','BL-U-33','M&E Officer','Translation FGD Mosul batch','2026-08-20',720,'USD',1,720,'INV-TR-07','PM','approved','Project Manager Ninewa','2026-08-21','2026-08-22'),
 ('EXP-0140','UNICEF-PCA-2026','BL-C-22','Project Manager Ninewa','Training venue cohort 1 and 2, Dohuk','2026-07-20',7800,'USD',1,7800,'INV-V-12','OD','paid','Operations Director','2026-07-15','2026-07-16'),
 ('EXP-0141','UNICEF-PCA-2026','BL-C-21','Finance Manager','Consultant F deliverables 1-3','2026-08-30',6000,'USD',1,6000,'INV-CF-03','OD','paid','Operations Director','2026-08-28','2026-08-29'),
 ('EXP-0142','UNICEF-PCA-2026','BL-C-23','Staff Member E','Training kits x70','2026-08-12',600,'USD',1,600,'R-11','PM','paid','Project Manager Ninewa','2026-08-12','2026-08-13'),
 ('EXP-0143','UNICEF-PCA-2026','BL-C-22','Project Manager Ninewa','Training venue cohort 3, Dohuk (deposit)','2026-09-04',1800,'USD',1,1800,'INV-V-15','FM','submitted',NULL,'2026-09-06',NULL),
 ('EXP-0144','UNICEF-PCA-2026','BL-C-31','Staff Member E','Per diem cohort 2 participants','2026-08-25',2100,'USD',1,2100,'PD-02','FM','approved','Finance Manager','2026-08-26','2026-08-27'),
 ('EXP-0145','CORE','BL-X-01','Finance Manager','Payroll Finance Assistant Jan-Aug','2026-08-31',7200,'USD',1,7200,'PAY-08','OD','paid','Operations Director','2026-08-27','2026-08-28');

INSERT INTO procurements (id, project_code, budget_line_id, description, est_value_usd, route, required_role, quotes_received, supplier, po_number, status, requested_by, approver, created_at) VALUES
 ('PR-2026-088','UNICEF-PCA-2026','BL-C-23','Training kits x35 cohort 3',350,'single-quote','PM',1,'Stationery Co','PO-2026-071','received','Staff Member E','Project Manager Ninewa','2026-08-12'),
 ('PR-2026-091','UNHCR-PPA-2026','BL-U-32','Vehicle hire Sep-Dec',3600,'three-quotes','FM',3,'Transport Ltd','PO-2026-074','ordered','Staff Member B','Finance Manager','2026-08-25'),
 ('PR-2026-094','UNICEF-PCA-2026','BL-C-22','Venue and catering cohort 3 and 4',9000,'rfq-committee','OD',2,NULL,NULL,'quoting','Project Manager Ninewa',NULL,'2026-09-02');

INSERT INTO venues (id, event, project_code, name, city, scores_json, weighted_score, quoted_usd, participants, site_visit, recommended, approved_by) VALUES
 ('VN-001','Teacher PSS training cohort 3','UNICEF-PCA-2026','Hotel A','Dohuk','{"security":4,"room":4,"cost":3,"accessibility":4,"catering":4,"terms":3}',3.7,4200,35,'2026-09-03 by PM',0,NULL),
 ('VN-002','Teacher PSS training cohort 3','UNICEF-PCA-2026','Hotel B','Dohuk','{"security":3,"room":3,"cost":5,"accessibility":3,"catering":3,"terms":4}',3.5,3600,35,NULL,0,NULL),
 ('VN-003','Teacher PSS training cohort 3','UNICEF-PCA-2026','Training Centre C','Dohuk','{"security":5,"room":4,"cost":2,"accessibility":5,"catering":3,"terms":3}',3.8,4900,35,'2026-09-03 by PM',1,NULL);

INSERT INTO travel (id, traveller, project_code, destination, purpose, depart_date, return_date, international, visa_required, visa_status, embassy_appointment, passport_custody_ref, advance_usd, settled_at, required_role, status, authorised_by) VALUES
 ('TRV-019','Staff Member A','UNHCR-PPA-2026','Amman','Donor workshop','2026-09-20','2026-09-24',1,1,'issued','2026-09-02','PC-014',450,NULL,'OD','authorised','Operations Director'),
 ('TRV-015','Staff Member B','UNHCR-PPA-2026','Sinjar','PDM round 2','2026-08-25','2026-08-28',0,0,'n/a',NULL,NULL,120,NULL,'PM','authorised','Project Manager Ninewa'),
 ('TRV-021','Staff Member D','UNICEF-PCA-2026','Amman','Regional planning meeting','2026-10-05','2026-10-08',1,1,'not started',NULL,NULL,0,NULL,'OD','requested',NULL);

INSERT INTO leave_ledger (staff_id, entry_date, type, days, approved_by) VALUES
 ('S-001','2026-02-28','accrual',1.75,'HR'),('S-001','2026-03-31','accrual',1.75,'HR'),('S-001','2026-04-30','accrual',1.75,'HR'),('S-001','2026-05-31','accrual',1.75,'HR'),('S-001','2026-06-30','accrual',1.75,'HR'),('S-001','2026-07-31','accrual',1.75,'HR'),('S-001','2026-08-31','accrual',1.75,'HR'),('S-001','2026-08-10','annual',-3,'PM'),
 ('S-004','2026-01-31','accrual',1.75,'HR'),('S-004','2026-02-28','accrual',1.75,'HR'),('S-004','2026-03-31','accrual',1.75,'HR'),('S-004','2026-04-30','accrual',1.75,'HR'),('S-004','2026-05-31','accrual',1.75,'HR'),('S-004','2026-06-30','accrual',1.75,'HR'),('S-004','2026-07-31','accrual',1.75,'HR'),('S-004','2026-08-31','accrual',1.75,'HR'),('S-004','2026-08-15','annual',-2,'OD'),
 ('S-003','2026-01-31','accrual',1.17,'HR'),('S-003','2026-02-28','accrual',1.17,'HR'),('S-003','2026-03-31','accrual',1.17,'HR'),('S-003','2026-04-30','accrual',1.17,'HR'),('S-003','2026-05-31','accrual',1.17,'HR'),('S-003','2026-06-30','accrual',1.17,'HR'),('S-003','2026-07-31','accrual',1.17,'HR'),('S-003','2026-08-31','accrual',1.17,'HR'),
 ('S-002','2026-04-30','accrual',1.75,'HR'),('S-002','2026-05-31','accrual',1.75,'HR'),('S-002','2026-06-30','accrual',1.75,'HR'),('S-002','2026-07-31','accrual',1.75,'HR'),('S-002','2026-08-31','accrual',1.75,'HR');

INSERT INTO vacancies (ref, title, project_code, duty_station, essential_criteria_json, opened_at, closes_at, status) VALUES
 ('VAC-2026-014','M&E Officer','UNICEF-PCA-2026','Dohuk','["University degree in social sciences, statistics or related field","Minimum 3 years M&E experience with NGOs or UN agencies","Fluent Arabic and English, Kurdish an advantage","Experience with KoboToolbox or ODK","Right to work in Iraq"]','2026-08-25','2026-09-08','open');

INSERT INTO candidates (id, vacancy_ref, candidate_ref, cv_text, status) VALUES
 ('CAND-001','VAC-2026-014','C-001','Education: BSc Statistics, University of Mosul, 2018. Experience: M&E Assistant, local NGO, Mosul, 2019-2021 (data collection, Kobo forms, cleaning). M&E Officer, INGO, Dohuk, 2021-2025 (indicator tracking, PDM surveys, donor reports for UNHCR and WFP). Languages: Arabic native, English fluent (IELTS 7), Kurdish Sorani basic. Iraqi national.','received'),
 ('CAND-002','VAC-2026-014','C-002','Education: Diploma in accounting, 2015. Experience: Finance assistant 2016-2020, logistics officer 2020-2024 with INGO in Erbil. Some support to M&E team during distributions. Languages: Arabic native, English intermediate. Iraqi national.','received'),
 ('CAND-003','VAC-2026-014','C-003','Education: MA Development Studies, 2020. Experience: Research assistant, university, 2020-2022 (surveys, SPSS). M&E Officer, UN agency implementing partner, Baghdad, 2022-2026 (logframes, Kobo/ODK, quarterly reports, evaluations). Languages: Arabic native, English fluent, Kurdish none. Iraqi national.','received');
