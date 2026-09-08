"""Generate SOC editable Excel templates. Run: python3 scripts/build_xlsx_templates.py"""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment

ROOT = os.path.join(os.path.dirname(__file__), "..", "templates")
FONT = "Arial"
HDR_FILL = PatternFill("solid", fgColor="1F3A5F")
HDR_FONT = Font(name=FONT, bold=True, color="FFFFFF", size=10)
BODY = Font(name=FONT, size=10)
INPUT_FONT = Font(name=FONT, size=10, color="0000FF")
INPUT_FILL = PatternFill("solid", fgColor="FFF2CC")
TITLE = Font(name=FONT, bold=True, size=14, color="1F3A5F")
NOTE = Font(name=FONT, italic=True, size=9, color="555555")
THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def title(ws, text, sub=None):
    ws["A1"] = text
    ws["A1"].font = TITLE
    if sub:
        ws["A2"] = sub
        ws["A2"].font = NOTE
    ws["A3"] = "Legend: yellow cells with blue text are inputs. Black cells are formulas, do not overwrite. Example rows show expected format, replace them."
    ws["A3"].font = NOTE


def header(ws, row, cols, widths=None):
    for i, c in enumerate(cols, 1):
        cell = ws.cell(row=row, column=i, value=c)
        cell.font = HDR_FONT
        cell.fill = HDR_FILL
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        cell.border = BORDER
        if widths:
            ws.column_dimensions[get_column_letter(i)].width = widths[i - 1]
    ws.row_dimensions[row].height = 32
    ws.freeze_panes = ws.cell(row=row + 1, column=1)


def put(ws, row, col, val, inp=False, fmt=None):
    c = ws.cell(row=row, column=col, value=val)
    c.font = INPUT_FONT if inp else BODY
    if inp:
        c.fill = INPUT_FILL
    c.border = BORDER
    c.alignment = Alignment(wrap_text=True, vertical="top")
    if fmt:
        c.number_format = fmt
    return c


def save(wb, sub, name):
    p = os.path.join(ROOT, sub, name)
    wb.save(p)
    print("wrote", p)


# ---------------------------------------------------------------- M&E glossary
def glossary():
    wb = Workbook()
    ws = wb.active
    ws.title = "Glossary"
    title(ws, "SOC Arabic-English Translation Glossary", "Preferred English phrasing for Arabic terms in M&E, HR, finance and protection contexts. Owner: M&E Officer. Review every 6 months.")
    cols = ["Arabic term", "Transliteration", "Preferred English", "Do not use", "Context note", "Domain", "Source", "Last reviewed"]
    header(ws, 5, cols, [22, 22, 30, 26, 44, 12, 18, 14])
    rows = [
        ("نازح / نازحون", "nazih / nazihun", "internally displaced person (IDP)", "refugee, displaced (alone)", "Iraqis displaced inside Iraq. 'Refugee' only for those who crossed a border.", "M&E", "IASC", "2026-09"),
        ("عائد / عائدون", "a'id / a'idun", "returnee", "returned person", "Returned to area of origin after displacement.", "M&E", "IOM DTM", "2026-09"),
        ("المجتمع المضيف", "al-mujtama' al-mudif", "host community", "locals, residents", "Community receiving IDPs or refugees.", "M&E", "UNHCR", "2026-09"),
        ("مستفيد", "mustafid", "beneficiary", "recipient, client", "Use 'participant' in training contexts.", "M&E", "SOC", "2026-09"),
        ("مشارك", "musharik", "participant", "attendee, trainee", "Trainings, workshops, FGDs.", "M&E", "SOC", "2026-09"),
        ("محافظة", "muhafaza", "governorate", "province, state", "Iraq first-level administrative unit.", "M&E", "SOC", "2026-09"),
        ("قضاء", "qadha", "district", "county", "Iraq second-level administrative unit.", "M&E", "SOC", "2026-09"),
        ("ناحية", "nahiya", "sub-district", "township", "Iraq third-level administrative unit.", "M&E", "SOC", "2026-09"),
        ("مختار", "mukhtar", "mukhtar (community leader)", "mayor, chief", "Keep transliteration with gloss on first use.", "M&E", "SOC", "2026-09"),
        ("البطاقة التموينية", "al-bitaqa al-tamwiniya", "PDS card (Public Distribution System ration card)", "food card", "Iraq public food ration entitlement document.", "M&E", "WFP", "2026-09"),
        ("هوية الأحوال المدنية", "hawiyat al-ahwal al-madaniya", "civil status ID", "civil ID, identity card", "Legacy Iraqi ID document.", "Protection", "UNHCR", "2026-09"),
        ("البطاقة الوطنية الموحدة", "al-bitaqa al-wataniya al-muwahhada", "unified national ID card", "national ID", "Current Iraqi ID document.", "Protection", "UNHCR", "2026-09"),
        ("بطاقة السكن", "bitaqat al-sakan", "residency card", "housing card", "Iraqi proof of residence.", "Protection", "UNHCR", "2026-09"),
        ("مخيم", "mukhayyam", "camp", "settlement (unless informal)", "Formal IDP or refugee camp.", "M&E", "CCCM", "2026-09"),
        ("مستوطنة غير رسمية / عشوائيات", "ashwa'iyat", "informal settlement", "slum, squatter area", "", "M&E", "CCCM", "2026-09"),
        ("أشخاص ذوو الإعاقة", "ashkhas dhawu al-i'aqa", "persons with disabilities", "disabled, handicapped", "Person-first language.", "Protection", "CRPD", "2026-09"),
        ("رب / ربة الأسرة", "rabb al-usra", "head of household", "family head", "Record sex of head of household separately.", "M&E", "SOC", "2026-09"),
        ("أسرة", "usra", "household", "family", "Household is the M&E unit; family is a social unit.", "M&E", "SOC", "2026-09"),
        ("سبل العيش", "subul al-'aysh", "livelihoods", "income sources", "", "M&E", "Cluster", "2026-09"),
        ("المساعدات النقدية", "al-musa'adat al-naqdiya", "cash assistance", "cash aid, money help", "Specify modality: multipurpose cash, conditional, voucher.", "Finance", "CaLP", "2026-09"),
        ("قسيمة", "qasima", "voucher", "coupon", "", "Finance", "CaLP", "2026-09"),
        ("النقد متعدد الأغراض", "al-naqd muta'addid al-aghrad", "multipurpose cash assistance (MPCA)", "general cash", "", "Finance", "CaLP", "2026-09"),
        ("الحماية", "al-himaya", "protection", "safety, security", "Humanitarian sense. 'Security' is for physical/safety of staff.", "Protection", "GPC", "2026-09"),
        ("العنف القائم على النوع الاجتماعي", "al-'unf al-qa'im 'ala al-naw' al-ijtima'i", "gender-based violence (GBV)", "domestic violence (unless specific)", "", "Protection", "GBV AoR", "2026-09"),
        ("حماية الطفل", "himayat al-tifl", "child protection", "child safety", "", "Protection", "CP AoR", "2026-09"),
        ("الإحالة", "al-ihala", "referral", "transfer, forwarding", "Referral pathway = مسار الإحالة.", "Protection", "GPC", "2026-09"),
        ("الموافقة المستنيرة", "al-muwafaqa al-mustanira", "informed consent", "permission, agreement", "", "M&E", "SOC", "2026-09"),
        ("عدم الإضرار", "'adam al-idrar", "Do No Harm", "harmlessness", "SOC core principle, capitalised.", "M&E", "SOC", "2026-09"),
        ("المساءلة أمام السكان المتضررين", "al-musa'ala amam al-sukkan al-mutadarririn", "accountability to affected populations (AAP)", "accountability to beneficiaries", "", "M&E", "IASC", "2026-09"),
        ("آلية الشكاوى والتغذية الراجعة", "aliyat al-shakawa wa al-taghdhiya al-raji'a", "complaints and feedback mechanism (CFM)", "complaint box", "", "M&E", "IASC", "2026-09"),
        ("المؤشر", "al-mu'ashshir", "indicator", "measure, metric", "", "M&E", "SOC", "2026-09"),
        ("خط الأساس", "khatt al-asas", "baseline", "starting point", "", "M&E", "SOC", "2026-09"),
        ("الهدف / المستهدف", "al-hadaf / al-mustahdaf", "target", "goal (for logframe goal use 'goal')", "'Target' is the numeric aim; 'objective' is the logframe level.", "M&E", "SOC", "2026-09"),
        ("النتيجة", "al-natija", "outcome", "result (generic)", "Logframe level between output and impact.", "M&E", "SOC", "2026-09"),
        ("المخرج", "al-mukhraj", "output", "product", "", "M&E", "SOC", "2026-09"),
        ("الأثر", "al-athar", "impact", "effect", "", "M&E", "SOC", "2026-09"),
        ("التقييم", "al-taqyim", "evaluation", "assessment (use for needs assessment)", "Evaluation judges a programme; assessment measures needs.", "M&E", "OECD DAC", "2026-09"),
        ("تقييم الاحتياجات", "taqyim al-ihtiyajat", "needs assessment", "needs evaluation", "", "M&E", "SOC", "2026-09"),
        ("الرصد", "al-rasd", "monitoring", "observation, tracking", "", "M&E", "SOC", "2026-09"),
        ("مقابلة مع مخبر رئيسي", "muqabala ma' mukhbir ra'isi", "key informant interview (KII)", "expert interview", "", "M&E", "SOC", "2026-09"),
        ("مجموعة النقاش المركزة", "majmu'at al-niqash al-murakkaza", "focus group discussion (FGD)", "group interview", "", "M&E", "SOC", "2026-09"),
        ("العينة", "al-'ayyina", "sample", "selection", "", "M&E", "SOC", "2026-09"),
        ("الاستبيان", "al-istibyan", "questionnaire / survey", "form", "", "M&E", "SOC", "2026-09"),
        ("عقد عمل", "'aqd 'amal", "employment contract", "work agreement", "", "HR", "SOC", "2026-09"),
        ("عقد محدد المدة", "'aqd muhaddad al-mudda", "fixed-term contract", "limited contract", "", "HR", "SOC", "2026-09"),
        ("فترة التجربة", "fatrat al-tajriba", "probation period", "trial period", "", "HR", "SOC", "2026-09"),
        ("فترة الإشعار", "fatrat al-ish'ar", "notice period", "warning period", "", "HR", "SOC", "2026-09"),
        ("إنهاء الخدمة", "inha' al-khidma", "termination of employment", "firing, dismissal (misconduct only)", "", "HR", "SOC", "2026-09"),
        ("مكافأة نهاية الخدمة", "mukafa'at nihayat al-khidma", "end-of-service benefit", "severance (donor context ok)", "", "HR", "SOC", "2026-09"),
        ("الإجازة السنوية", "al-ijaza al-sanawiya", "annual leave", "holiday, vacation", "", "HR", "SOC", "2026-09"),
        ("الإجازة المرضية", "al-ijaza al-maradiya", "sick leave", "medical leave", "", "HR", "SOC", "2026-09"),
        ("الضمان الاجتماعي", "al-daman al-ijtima'i", "social security", "social insurance", "", "HR", "SOC", "2026-09"),
        ("كشف الرواتب", "kashf al-rawatib", "payroll register", "salary list", "", "Finance", "SOC", "2026-09"),
        ("قسيمة الراتب", "qasimat al-ratib", "payslip", "salary slip", "", "Finance", "SOC", "2026-09"),
        ("بدل المعيشة اليومي", "badal al-ma'isha al-yawmi", "per diem (daily subsistence allowance)", "daily allowance", "", "Finance", "SOC", "2026-09"),
        ("سلفة", "sulfa", "cash advance", "loan", "", "Finance", "SOC", "2026-09"),
        ("تسوية", "taswiya", "settlement (of advance)", "clearance", "", "Finance", "SOC", "2026-09"),
        ("الموازنة", "al-muwazana", "budget", "estimate", "", "Finance", "SOC", "2026-09"),
        ("بند الموازنة", "band al-muwazana", "budget line", "budget item", "", "Finance", "SOC", "2026-09"),
        ("المصروفات الفعلية", "al-masrufat al-fi'liya", "actual expenditure", "real spending", "", "Finance", "SOC", "2026-09"),
        ("عرض سعر", "'ard si'r", "quotation", "price offer", "", "Logistics", "SOC", "2026-09"),
        ("أمر شراء", "amr shira'", "purchase order (PO)", "buying order", "", "Logistics", "SOC", "2026-09"),
        ("محضر استلام", "mahdar istilam", "goods received note (GRN)", "receipt report", "", "Logistics", "SOC", "2026-09"),
        ("مناقصة", "munaqasa", "tender", "bid (for the supplier's response)", "", "Logistics", "SOC", "2026-09"),
        ("المانح", "al-manih", "donor", "funder, sponsor", "", "Finance", "SOC", "2026-09"),
        ("الشريك المنفذ", "al-sharik al-munaffidh", "implementing partner", "executing partner", "", "M&E", "SOC", "2026-09"),
        ("منظمة غير حكومية", "munazzama ghayr hukumiya", "non-governmental organisation (NGO)", "charity", "", "M&E", "SOC", "2026-09"),
    ]
    for r, row in enumerate(rows, 6):
        for c, v in enumerate(row, 1):
            put(ws, r, c, v, inp=True)
    # phrasing rules sheet
    ws2 = wb.create_sheet("Phrasing rules")
    title(ws2, "Preferred phrasing and style rules")
    header(ws2, 5, ["Rule", "Example (do)", "Example (do not)"], [50, 50, 50])
    rules = [
        ("Translate meaning, not words. Keep the speaker's register.", "\"We had nothing to feed the children that week.\"", "\"Food insecurity was experienced at household level.\""),
        ("Keep Arabic source text alongside every English quote, with record ID.", "\"...\" (REC-0231, FGD-W-Mosul-02)", "Quote with no source reference"),
        ("Never merge respondents into one composite quote.", "Two short quotes with two IDs", "One long quote stitched from several people"),
        ("Untranslatable terms: transliterate, gloss on first use, then use transliteration.", "mukhtar (community leader)", "mayor"),
        ("Use 'governorate', 'district', 'sub-district' for Iraq.", "Ninewa governorate, Mosul district", "Ninewa province"),
        ("Use 'internally displaced person' for Iraqis displaced within Iraq.", "IDP households in Sinjar", "refugees in Sinjar"),
        ("Remove identifying detail from quotes: no names, villages under 2,000 people, employer names.", "\"a woman from a village near Tal Afar\"", "\"Umm Ahmed from [village name]\""),
        ("Do not translate allegations as fact. Attribute.", "\"Respondents reported that...\"", "\"The council stole the aid.\""),
        ("Numbers: Western digits, thousands separator, currency code after amount.", "250,000 IQD", "٢٥٠٠٠٠ دينار"),
        ("Dates: day month year in English text; ISO in tables.", "12 March 2026 / 2026-03-12", "3/12/2026"),
        ("British spelling in all SOC English documents.", "programme, organisation", "program, organization"),
    ]
    for r, row in enumerate(rules, 6):
        for c, v in enumerate(row, 1):
            put(ws2, r, c, v)
    save(wb, "me", "translation-glossary.xlsx")


# ---------------------------------------------------------------- ITT
def itt():
    wb = Workbook()
    ws = wb.active
    ws.title = "ITT"
    title(ws, "Indicator Tracking Table (ITT)", "One row per indicator. Owner: M&E Officer. Update monthly by the 10th.")
    cols = ["Indicator ID", "Project", "Logframe level", "Indicator definition", "Unit", "Disaggregation", "Baseline", "Target", "Q1", "Q2", "Q3", "Q4", "Cumulative", "% of target", "RAG", "Data source", "Frequency", "Responsible", "Last verified", "Notes"]
    header(ws, 5, cols, [12, 14, 12, 40, 10, 22, 10, 10, 8, 8, 8, 8, 12, 11, 8, 20, 12, 14, 12, 30])
    ex = [
        ("IND-01", "UNHCR-PPA-2026", "Output 1", "Number of IDP households receiving multipurpose cash assistance", "households", "sex of HoH, governorate", 0, 1200, 280, 310, None, None),
        ("IND-02", "UNHCR-PPA-2026", "Outcome 1", "% of assisted households reporting ability to meet basic needs (PDM)", "%", "sex of HoH", 31, 70, 48, 55, None, None),
        ("IND-03", "UNICEF-PCA-2026", "Output 2", "Number of teachers completing psychosocial support training", "persons", "sex, district", 0, 150, 40, 62, None, None),
    ]
    for r, row in enumerate(ex, 6):
        for c, v in enumerate(row, 1):
            put(ws, r, c, v, inp=True)
        put(ws, r, 13, f"=IF(E{r}=\"%\",IFERROR(INDEX(I{r}:L{r},MATCH(9.99E+307,I{r}:L{r})),\"\"),SUM(I{r}:L{r}))")
        put(ws, r, 14, f"=IFERROR(M{r}/H{r},\"\")", fmt="0%")
        put(ws, r, 15, f"=IF(N{r}=\"\",\"\",IF(N{r}>=0.9,\"G\",IF(N{r}>=0.6,\"A\",\"R\")))")
        put(ws, r, 16, "Kobo PDM survey", inp=True)
        put(ws, r, 17, "Quarterly", inp=True)
        put(ws, r, 18, "M&E Officer", inp=True)
        put(ws, r, 19, "2026-07-10", inp=True)
        put(ws, r, 20, "Cumulative column: sums quarters for counts, takes latest quarter for % indicators.", inp=True)
    ws["A10"] = "RAG rule: G at or above 90% of target, A 60-89%, R below 60%. Adjust thresholds per donor in the Notes column."
    ws["A10"].font = NOTE
    ws2 = wb.create_sheet("Data quality log")
    title(ws2, "Data Quality Log")
    header(ws2, 5, ["Date", "Project", "Tool / dataset", "Issue type", "Description", "Records affected", "Action taken", "Owner", "Status", "Closed date"], [12, 14, 20, 16, 40, 12, 36, 14, 10, 12])
    put(ws2, 6, 1, "2026-07-03", inp=True); put(ws2, 6, 2, "UNHCR-PPA-2026", inp=True); put(ws2, 6, 3, "PDM round 2", inp=True); put(ws2, 6, 4, "Duplicate", inp=True); put(ws2, 6, 5, "12 duplicate household IDs from enumerator E-07 re-uploads", inp=True); put(ws2, 6, 6, 12, inp=True); put(ws2, 6, 7, "Duplicates removed, enumerator re-briefed on sync", inp=True); put(ws2, 6, 8, "M&E Officer", inp=True); put(ws2, 6, 9, "Closed", inp=True); put(ws2, 6, 10, "2026-07-04", inp=True)
    ws3 = wb.create_sheet("Translation log")
    title(ws3, "Translation Log")
    header(ws3, 5, ["Item ID", "Project", "Source file (Arabic)", "Words", "Translator", "Date sent", "Draft received", "Reviewer", "Review date", "Glossary flags", "Sensitive content check by", "Status", "Final file"], [12, 14, 28, 8, 16, 12, 12, 16, 12, 12, 18, 12, 28])
    put(ws3, 6, 1, "TR-0041", inp=True); put(ws3, 6, 2, "UNHCR-PPA-2026", inp=True); put(ws3, 6, 3, "FGD-W-Mosul-02_AR.docx", inp=True); put(ws3, 6, 4, 2300, inp=True); put(ws3, 6, 5, "Contracted translator A", inp=True); put(ws3, 6, 6, "2026-07-05", inp=True); put(ws3, 6, 7, "2026-07-07", inp=True); put(ws3, 6, 8, "M&E Officer", inp=True); put(ws3, 6, 9, "2026-07-08", inp=True); put(ws3, 6, 10, 2, inp=True); put(ws3, 6, 11, "PM", inp=True); put(ws3, 6, 12, "Final", inp=True); put(ws3, 6, 13, "FGD-W-Mosul-02_EN_final.docx", inp=True)
    save(wb, "me", "indicator-tracking-table.xlsx")


# ---------------------------------------------------------------- HR rubric
def rubric():
    wb = Workbook()
    ws = wb.active
    ws.title = "Rubric"
    title(ws, "Candidate Evaluation Rubric", "Score 1-5 per criterion using the descriptors on the Descriptors sheet. Weighted total is calculated. Minimum 2 panellists.")
    put(ws, 5, 1, "Position"); put(ws, 5, 2, "M&E Officer, Erbil", inp=True)
    put(ws, 6, 1, "Vacancy ref"); put(ws, 6, 2, "VAC-2026-014", inp=True)
    put(ws, 7, 1, "Panel"); put(ws, 7, 2, "HR Officer, PM, independent panellist", inp=True)
    put(ws, 8, 1, "Conflict of interest declared?"); put(ws, 8, 2, "None declared", inp=True)
    header(ws, 10, ["Criterion", "Weight %", "Candidate 1 P1", "Candidate 1 P2", "Candidate 2 P1", "Candidate 2 P2", "Candidate 3 P1", "Candidate 3 P2"], [42, 10, 14, 14, 14, 14, 14, 14])
    crit = [("Relevant experience (years, sector, similar role)", 30), ("Technical skills (tools, methods, systems)", 25), ("Language: Arabic and English as required", 15), ("Context knowledge: Iraq, humanitarian principles, Do No Harm", 15), ("Interview and written test performance", 15)]
    for r, (c, w) in enumerate(crit, 11):
        put(ws, r, 1, c); put(ws, r, 2, w / 100, inp=True, fmt="0%")
        for col in range(3, 9):
            put(ws, r, col, [4, 3, 5, 4, 3, 3][col - 3] if r == 11 else 3, inp=True)
    put(ws, 16, 1, "Weight check (must be 100%)"); put(ws, 16, 2, "=SUM(B11:B15)", fmt="0%")
    put(ws, 17, 1, "Weighted score per panellist (max 5)")
    for col in range(3, 9):
        L = get_column_letter(col)
        put(ws, 17, col, f"=SUMPRODUCT($B$11:$B$15,{L}11:{L}15)", fmt="0.00")
    put(ws, 18, 1, "Candidate average (max 5)")
    put(ws, 18, 3, "=AVERAGE(C17:D17)", fmt="0.00"); put(ws, 18, 5, "=AVERAGE(E17:F17)", fmt="0.00"); put(ws, 18, 7, "=AVERAGE(G17:H17)", fmt="0.00")
    put(ws, 19, 1, "Rank")
    put(ws, 19, 3, "=RANK(C18,(C18,E18,G18))"); put(ws, 19, 5, "=RANK(E18,(C18,E18,G18))"); put(ws, 19, 7, "=RANK(G18,(C18,E18,G18))")
    put(ws, 20, 1, "Panellist divergence flag (>1.5 points)")
    put(ws, 20, 3, "=IF(ABS(C17-D17)>1.5,\"Discuss\",\"OK\")"); put(ws, 20, 5, "=IF(ABS(E17-F17)>1.5,\"Discuss\",\"OK\")"); put(ws, 20, 7, "=IF(ABS(G17-H17)>1.5,\"Discuss\",\"OK\")")
    put(ws, 22, 1, "Recommendation"); put(ws, 22, 2, "Candidate 2 recommended subject to references and sanctions screening.", inp=True)
    ws.merge_cells("B22:H22")
    put(ws, 23, 1, "Panel signatures and date"); put(ws, 23, 2, "", inp=True); ws.merge_cells("B23:H23")
    ws2 = wb.create_sheet("Descriptors")
    title(ws2, "Scoring descriptors")
    header(ws2, 5, ["Score", "Descriptor"], [8, 90])
    for r, (s, d) in enumerate([(1, "Does not meet the criterion. No relevant evidence."), (2, "Partially meets. Limited or indirect evidence."), (3, "Meets. Clear evidence at the level required for the role."), (4, "Exceeds. Strong evidence, could operate with minimal supervision."), (5, "Substantially exceeds. Evidence of leading or improving practice in this area.")], 6):
        put(ws2, r, 1, s); put(ws2, r, 2, d)
    ws3 = wb.create_sheet("Longlist")
    title(ws3, "CV screening longlist (essential criteria pass/fail only)")
    header(ws3, 5, ["Candidate ID", "Application date", "Essential 1: degree or equivalent", "Essential 2: 3 years M&E experience", "Essential 3: Arabic and English", "Essential 4: right to work at duty station", "Pass / Fail", "Screened by", "Note"], [12, 12, 18, 18, 18, 18, 10, 14, 30])
    for r in range(6, 9):
        put(ws3, r, 1, f"C-{r-5:03d}", inp=True); put(ws3, r, 2, "2026-08-20", inp=True)
        for col in range(3, 7):
            put(ws3, r, col, "Y" if not (r == 7 and col == 4) else "N", inp=True)
        put(ws3, r, 7, f"=IF(COUNTIF(C{r}:F{r},\"Y\")=4,\"Pass\",\"Fail\")")
        put(ws3, r, 8, "HR Officer", inp=True); put(ws3, r, 9, "", inp=True)
    save(wb, "hr", "candidate-evaluation-rubric.xlsx")


# ---------------------------------------------------------------- HR onboarding/offboarding
def onboarding():
    wb = Workbook()
    ws = wb.active
    ws.title = "Onboarding"
    title(ws, "Onboarding Checklist (first 5 working days)")
    put(ws, 5, 1, "Employee"); put(ws, 5, 2, "", inp=True); put(ws, 6, 1, "Start date"); put(ws, 6, 2, "", inp=True); put(ws, 7, 1, "Line manager"); put(ws, 7, 2, "", inp=True)
    header(ws, 9, ["#", "Item", "Owner", "Due (day)", "Done (Y/N)", "Date", "Signature"], [5, 60, 16, 10, 10, 12, 18])
    items = [
        ("Signed contract, ID copy, bank details, emergency contact in file", "HR Officer", 1), ("Signed code of conduct, PSEA declaration, conflict of interest form", "HR Officer", 1), ("Sanctions screening result filed", "HR Officer", 1), ("Email, shared drive access at correct permission level, laptop issued and tagged", "IT / OD", 1), ("Security briefing and emergency contact card", "OD", 2), ("Safeguarding, PSEA, data protection training", "HR Officer", 2), ("Finance induction: thresholds, expense claims, advances", "FM", 3), ("Procurement induction: routes, quotes, PO", "FM", 3), ("M&E systems: Kobo, ITT, translation workflow, glossary", "M&E Officer", 4), ("30-60-90 day objectives agreed and filed", "Line manager", 5), ("Probation review meeting scheduled (month 3)", "HR Officer", 5), ("Timesheet and donor allocation explained", "FM", 5),
    ]
    for r, (i, o, d) in enumerate(items, 10):
        put(ws, r, 1, r - 9); put(ws, r, 2, i); put(ws, r, 3, o); put(ws, r, 4, d); put(ws, r, 5, "", inp=True); put(ws, r, 6, "", inp=True); put(ws, r, 7, "", inp=True)
    put(ws, 23, 1, ""); put(ws, 23, 2, "Completion"); put(ws, 23, 5, f"=COUNTIF(E10:E21,\"Y\")/12", fmt="0%")
    ws2 = wb.create_sheet("Offboarding")
    title(ws2, "Offboarding Checklist (all items signed before final payment)")
    put(ws2, 5, 1, "Employee"); put(ws2, 5, 2, "", inp=True); put(ws2, 6, 1, "Last working day"); put(ws2, 6, 2, "", inp=True); put(ws2, 7, 1, "Reason (end of funding / resignation / non-performance / misconduct / redundancy)"); put(ws2, 7, 2, "", inp=True)
    header(ws2, 9, ["#", "Item", "Owner", "Done (Y/N)", "Date", "Signature"], [5, 60, 16, 10, 12, 18])
    items = [
        ("Notice acknowledged in writing, dates confirmed", "HR Officer"), ("Handover note approved by line manager", "Line manager"), ("Assets returned and asset register updated", "OD"), ("Advances settled, expense claims closed", "FM"), ("Leave balance calculated and verified", "HR Officer / FM"), ("Final settlement statement prepared and signed by employee", "FM"), ("Exit interview completed", "HR Officer"), ("Email, drive, systems access removed on last day", "IT / OD"), ("Experience certificate issued", "HR Officer"), ("Staff file archived (restricted)", "HR Officer"), ("Donor notified if key personnel", "PM"),
    ]
    for r, (i, o) in enumerate(items, 10):
        put(ws2, r, 1, r - 9); put(ws2, r, 2, i); put(ws2, r, 3, o); put(ws2, r, 4, "", inp=True); put(ws2, r, 5, "", inp=True); put(ws2, r, 6, "", inp=True)
    put(ws2, 22, 2, "Final payment released only when all items are Y"); put(ws2, 22, 4, "=IF(COUNTIF(D10:D20,\"Y\")=11,\"Release\",\"Hold\")")
    save(wb, "hr", "onboarding-offboarding-checklist.xlsx")


# ---------------------------------------------------------------- Payroll & leave tracker
def payroll():
    wb = Workbook()
    ws = wb.active
    ws.title = "Staff register"
    title(ws, "Staff Register", "Single source of truth for HR data. Restricted folder. Owner: HR Officer.")
    cols = ["Staff ID", "Name", "Position", "Grade", "Duty station", "Country", "Contract type", "Start date", "Contract end", "Probation end", "Renewal count", "Line manager", "Gross monthly salary", "Currency", "Donor 1", "Alloc 1 %", "Donor 2", "Alloc 2 %", "Alloc check", "Notice days", "Status"]
    header(ws, 5, cols, [10, 20, 20, 8, 12, 10, 16, 12, 12, 12, 10, 16, 14, 9, 16, 9, 16, 9, 10, 9, 10])
    ex = [
        ("S-001", "Example Name A", "M&E Officer", "C", "Erbil", "Iraq", "One-year fixed", "2026-02-01", "2027-01-31", "2026-04-30", 0, "PM", 1800, "USD", "UNHCR-PPA-2026", 0.6, "UNICEF-PCA-2026", 0.4, None, 30, "Active"),
        ("S-002", "Example Name B", "Field Officer", "B", "Mosul", "Iraq", "Month-to-month", "2026-06-01", "2026-09-30", "2026-08-31", 3, "PM", 1100, "USD", "UNHCR-PPA-2026", 1.0, "", 0, None, 15, "Active"),
        ("S-003", "Example Name C", "Finance Assistant", "B", "Amman", "Jordan", "One-year fixed", "2025-10-01", "2026-09-30", "2025-12-31", 1, "FM", 900, "JOD", "Core", 1.0, "", 0, None, 30, "Active"),
    ]
    for r, row in enumerate(ex, 6):
        for c, v in enumerate(row, 1):
            if c == 19:
                put(ws, r, c, f"=IF(ROUND(P{r}+R{r},2)=1,\"OK\",\"Check\")")
            elif c in (16, 18):
                put(ws, r, c, v, inp=True, fmt="0%")
            else:
                put(ws, r, c, v, inp=True)
    ws["A10"] = "Alerts (as of date in B11):"; ws["A10"].font = NOTE
    put(ws, 11, 1, "As of"); put(ws, 11, 2, "2026-09-08", inp=True)
    put(ws, 12, 1, "Contracts ending within 45 days"); put(ws, 12, 2, "=SUMPRODUCT((I6:I8<>\"\")*((DATEVALUE(I6:I8)-DATEVALUE(B11))<=45)*((DATEVALUE(I6:I8)-DATEVALUE(B11))>=0))")
    put(ws, 13, 1, "Month-to-month renewals at 6 or more"); put(ws, 13, 2, "=COUNTIFS(G6:G8,\"Month-to-month\",K6:K8,\">=6\")")
    ws.cell(row=12, column=2).comment = Comment("Dates are stored as text ISO strings so they survive locale changes; DATEVALUE converts them. If you enter true Excel dates instead, replace DATEVALUE(x) with x.", "SOC")

    ws2 = wb.create_sheet("Payroll 2026-09")
    title(ws2, "Monthly Payroll Register", "Copy this sheet per month. Timesheets due 25th, FM calculates by 27th, OD approves, two-signatory transfer by last working day.")
    cols = ["Staff ID", "Name", "Currency", "Gross salary", "Days worked", "Working days in month", "Gross earned", "Employee social security %", "Employee SS", "Income tax", "Other deductions", "Net pay", "Employer social security %", "Employer SS", "Total cost", "Donor 1", "Alloc 1 %", "Cost to donor 1", "Donor 2", "Alloc 2 %", "Cost to donor 2"]
    header(ws2, 5, cols, [10, 20, 9, 12, 10, 12, 12, 12, 11, 10, 11, 12, 12, 11, 12, 16, 9, 13, 16, 9, 13])
    ws2["A4"] = "Rates below are placeholders. Verify current statutory rates for Iraq (2023 social security law) and Jordan with counsel before the first run."; ws2["A4"].font = NOTE
    ex = [("S-001", "Example Name A", "USD", 1800, 22, 22, 0.05, 0, 0, 0.12, "UNHCR-PPA-2026", 0.6, "UNICEF-PCA-2026", 0.4), ("S-002", "Example Name B", "USD", 1100, 20, 22, 0.05, 0, 0, 0.12, "UNHCR-PPA-2026", 1.0, "", 0), ("S-003", "Example Name C", "JOD", 900, 22, 22, 0.075, 0, 0, 0.1425, "Core", 1.0, "", 0)]
    for r, (sid, n, cur, g, dw, wd, ess, tax, oth, ers, d1, a1, d2, a2) in enumerate(ex, 6):
        put(ws2, r, 1, sid, inp=True); put(ws2, r, 2, n, inp=True); put(ws2, r, 3, cur, inp=True); put(ws2, r, 4, g, inp=True, fmt="#,##0.00"); put(ws2, r, 5, dw, inp=True); put(ws2, r, 6, wd, inp=True)
        put(ws2, r, 7, f"=D{r}*E{r}/F{r}", fmt="#,##0.00"); put(ws2, r, 8, ess, inp=True, fmt="0.00%"); put(ws2, r, 9, f"=G{r}*H{r}", fmt="#,##0.00"); put(ws2, r, 10, tax, inp=True, fmt="#,##0.00"); put(ws2, r, 11, oth, inp=True, fmt="#,##0.00")
        put(ws2, r, 12, f"=G{r}-I{r}-J{r}-K{r}", fmt="#,##0.00"); put(ws2, r, 13, ers, inp=True, fmt="0.00%"); put(ws2, r, 14, f"=G{r}*M{r}", fmt="#,##0.00"); put(ws2, r, 15, f"=G{r}+N{r}", fmt="#,##0.00")
        put(ws2, r, 16, d1, inp=True); put(ws2, r, 17, a1, inp=True, fmt="0%"); put(ws2, r, 18, f"=O{r}*Q{r}", fmt="#,##0.00"); put(ws2, r, 19, d2, inp=True); put(ws2, r, 20, a2, inp=True, fmt="0%"); put(ws2, r, 21, f"=O{r}*T{r}", fmt="#,##0.00")
    put(ws2, 9, 1, "Totals"); 
    for col in (7, 9, 12, 14, 15, 18, 21):
        L = get_column_letter(col); put(ws2, 9, col, f"=SUM({L}6:{L}8)", fmt="#,##0.00")
    put(ws2, 11, 1, "Prepared by (FM)"); put(ws2, 11, 2, "", inp=True); put(ws2, 12, 1, "Approved by (OD)"); put(ws2, 12, 2, "", inp=True); put(ws2, 13, 1, "Released by (two signatories)"); put(ws2, 13, 2, "", inp=True)

    ws3 = wb.create_sheet("Leave ledger")
    title(ws3, "Leave Ledger", "One row per leave transaction. Balance is running per staff ID. Accrual entered monthly by HR (Iraq 21 days per year = 1.75 per month, verify per country annex).")
    header(ws3, 5, ["Date", "Staff ID", "Type (Accrual / Annual / Sick / Public holiday / Unpaid / Other)", "Days (+ accrual, - taken)", "Approved by", "Running balance (annual leave)", "Note"], [12, 10, 40, 14, 14, 18, 30])
    ex = [("2026-07-31", "S-001", "Accrual", 1.75, "HR Officer"), ("2026-08-10", "S-001", "Annual", -3, "PM"), ("2026-08-31", "S-001", "Accrual", 1.75, "HR Officer"), ("2026-08-31", "S-002", "Accrual", 1.75, "HR Officer")]
    for r, (d, s, t, days, ap) in enumerate(ex, 6):
        put(ws3, r, 1, d, inp=True); put(ws3, r, 2, s, inp=True); put(ws3, r, 3, t, inp=True); put(ws3, r, 4, days, inp=True, fmt="0.00"); put(ws3, r, 5, ap, inp=True)
        put(ws3, r, 6, f"=SUMIFS($D$6:D{r},$B$6:B{r},B{r},$C$6:C{r},\"Accrual\")+SUMIFS($D$6:D{r},$B$6:B{r},B{r},$C$6:C{r},\"Annual\")", fmt="0.00")
        put(ws3, r, 7, "", inp=True)
    put(ws3, 11, 1, "Balances by staff"); header(ws3, 12, ["Staff ID", "Annual leave balance", "Alert (>15 days)"], None)
    for r, sid in enumerate(["S-001", "S-002", "S-003"], 13):
        put(ws3, r, 1, sid, inp=True)
        put(ws3, r, 2, f"=SUMIFS($D$6:$D$9,$B$6:$B$9,A{r},$C$6:$C$9,\"Accrual\")+SUMIFS($D$6:$D$9,$B$6:$B$9,A{r},$C$6:$C$9,\"Annual\")", fmt="0.00")
        put(ws3, r, 3, f"=IF(B{r}>15,\"Alert\",\"OK\")")
    save(wb, "hr", "payroll-and-leave-tracker.xlsx")


# ---------------------------------------------------------------- Budget worksheet
def budget():
    wb = Workbook()
    ws = wb.active
    ws.title = "Budget"
    title(ws, "Project Budget Worksheet (USD)", "For grants above USD 100k. Approved column locks on award. Actuals and commitments posted weekly by FM. Variance flag at 10%.")
    put(ws, 5, 1, "Project"); put(ws, 5, 2, "UNHCR-PPA-2026 Multipurpose cash, Ninewa", inp=True)
    put(ws, 6, 1, "Donor"); put(ws, 6, 2, "UNHCR", inp=True)
    put(ws, 7, 1, "Start"); put(ws, 7, 2, "2026-01-01", inp=True); put(ws, 7, 3, "End"); put(ws, 7, 4, "2026-12-31", inp=True)
    put(ws, 8, 1, "Months elapsed"); put(ws, 8, 2, 8, inp=True); put(ws, 8, 3, "Total months"); put(ws, 8, 4, 12, inp=True)
    put(ws, 9, 1, "Budget flexibility between lines without donor approval"); put(ws, 9, 2, 0.1, inp=True, fmt="0%")
    cols = ["Line code", "Category", "Description", "Unit", "Unit cost", "Qty", "Frequency", "Donor share %", "Approved total", "Donor approved", "Cost share", "Actual to date", "Committed", "Total spent + committed", "Remaining", "% burned", "Expected % (time)", "Variance vs time", "Flag", "Forecast to completion", "Note"]
    header(ws, 11, cols, [9, 14, 34, 10, 10, 7, 9, 9, 13, 13, 11, 13, 11, 14, 12, 9, 10, 11, 9, 14, 30])
    lines = [
        ("1.1", "Personnel", "Project Manager (60%)", "month", 3000, 1, 12, 1.0, 21600, 0),
        ("1.2", "Personnel", "M&E Officer (60%)", "month", 1800, 1, 12, 1.0, 12960, 0),
        ("1.3", "Personnel", "Field Officers x4", "month", 1100, 4, 12, 1.0, 35200, 0),
        ("2.1", "Programme", "Multipurpose cash transfers", "household", 400, 1200, 1, 1.0, 320000, 30000),
        ("2.2", "Programme", "Post-distribution monitoring (enumerators)", "day", 25, 240, 1, 1.0, 4000, 0),
        ("2.3", "Programme", "Cash delivery service fees", "transfer", 3, 1200, 1, 1.0, 2400, 0),
        ("3.1", "Operations", "Office rent Mosul (shared 40%)", "month", 800, 1, 12, 1.0, 3840, 0),
        ("3.2", "Operations", "Vehicle hire and fuel", "month", 900, 1, 12, 1.0, 7200, 1500),
        ("3.3", "Operations", "Translation services", "1000 words", 40, 60, 1, 1.0, 1200, 0),
        ("4.1", "Indirect", "Indirect cost recovery 7%", "lump", 1, 1, 1, 1.0, 22000, 0),
    ]
    first, last = 12, 12 + len(lines) - 1
    for r, (code, cat, desc, unit, uc, q, f, ds, act, com) in enumerate(lines, first):
        put(ws, r, 1, code, inp=True); put(ws, r, 2, cat, inp=True); put(ws, r, 3, desc, inp=True); put(ws, r, 4, unit, inp=True); put(ws, r, 5, uc, inp=True, fmt="#,##0.00"); put(ws, r, 6, q, inp=True); put(ws, r, 7, f, inp=True); put(ws, r, 8, ds, inp=True, fmt="0%")
        put(ws, r, 9, f"=E{r}*F{r}*G{r}", fmt="#,##0"); put(ws, r, 10, f"=I{r}*H{r}", fmt="#,##0"); put(ws, r, 11, f"=I{r}-J{r}", fmt="#,##0")
        put(ws, r, 12, act, inp=True, fmt="#,##0"); put(ws, r, 13, com, inp=True, fmt="#,##0")
        put(ws, r, 14, f"=L{r}+M{r}", fmt="#,##0"); put(ws, r, 15, f"=I{r}-N{r}", fmt="#,##0"); put(ws, r, 16, f"=IF(I{r}=0,0,N{r}/I{r})", fmt="0%")
        put(ws, r, 17, "=IF($D$8=0,0,$B$8/$D$8)", fmt="0%"); put(ws, r, 18, f"=P{r}-Q{r}", fmt="0%")
        put(ws, r, 19, f"=IF(ABS(R{r})>$B$9,\"Review\",\"OK\")")
        put(ws, r, 20, f"=IF($B$8=0,I{r},L{r}/$B$8*$D$8+M{r})", fmt="#,##0"); put(ws, r, 21, "", inp=True)
    t = last + 1
    put(ws, t, 1, "TOTAL"); ws.cell(row=t, column=1).font = Font(name=FONT, bold=True, size=10)
    for col in (9, 10, 11, 12, 13, 14, 15, 20):
        L = get_column_letter(col); put(ws, t, col, f"=SUM({L}{first}:{L}{last})", fmt="#,##0")
    put(ws, t, 16, f"=IF(I{t}=0,0,N{t}/I{t})", fmt="0%"); put(ws, t, 17, "=IF($D$8=0,0,$B$8/$D$8)", fmt="0%"); put(ws, t, 18, f"=P{t}-Q{t}", fmt="0%"); put(ws, t, 19, f"=IF(ABS(R{t})>$B$9,\"Review\",\"OK\")")
    put(ws, t + 2, 1, "Monthly burn rate (actual / months elapsed)"); put(ws, t + 2, 9, f"=IF($B$8=0,0,L{t}/$B$8)", fmt="#,##0")
    put(ws, t + 3, 1, "Months of budget remaining at current burn"); put(ws, t + 3, 9, f"=IF(I{t+2}=0,0,O{t}/I{t+2})", fmt="0.0")
    put(ws, t + 4, 1, "Forecast over / (under) spend at completion"); put(ws, t + 4, 9, f"=T{t}-I{t}", fmt="#,##0;(#,##0);-")
    ws.cell(row=t + 4, column=9).comment = Comment("Positive = forecast overspend, needs ED decision and realignment plan.", "SOC")
    # Phasing sheet
    ws2 = wb.create_sheet("Phasing")
    title(ws2, "Monthly phasing and cash forecast", "Plan column per month is entered from the workplan. Actual per month from ledger export. 90-day cash need drives tranche requests 30 days ahead.")
    header(ws2, 5, ["Month", "Planned spend", "Actual spend", "Cumulative plan", "Cumulative actual", "Variance", "Cash received", "Cash balance", "Next 90-day need", "Tranche request due"], [10, 13, 13, 14, 14, 12, 13, 13, 14, 16])
    months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]
    plan = [20000, 25000, 40000, 45000, 45000, 45000, 45000, 45000, 45000, 40000, 25000, 10400]
    actual = [15200, 22800, 38900, 44100, 46700, 43200, 41800, 44300, None, None, None, None]
    cash = [100000, 0, 0, 100000, 0, 0, 100000, 0, 0, 0, 0, 0]
    for r, m in enumerate(months, 6):
        put(ws2, r, 1, m, inp=True); put(ws2, r, 2, plan[r - 6], inp=True, fmt="#,##0"); put(ws2, r, 3, actual[r - 6], inp=True, fmt="#,##0")
        put(ws2, r, 4, f"=SUM($B$6:B{r})", fmt="#,##0"); put(ws2, r, 5, f"=SUM($C$6:C{r})", fmt="#,##0"); put(ws2, r, 6, f"=IF(C{r}=\"\",\"\",C{r}-B{r})", fmt="#,##0;(#,##0);-")
        put(ws2, r, 7, cash[r - 6], inp=True, fmt="#,##0"); put(ws2, r, 8, f"=SUM($G$6:G{r})-E{r}", fmt="#,##0;(#,##0);-")
        put(ws2, r, 9, f"=SUM(B{r+1}:B{min(r+3, 17)})", fmt="#,##0"); put(ws2, r, 10, f"=IF(H{r}<I{r},\"Request now\",\"Covered\")")
    ws3 = wb.create_sheet("Donor rules")
    title(ws3, "Donor rules and ineligible costs for this grant (fill on award day)")
    header(ws3, 5, ["Topic", "Rule per agreement", "Agreement clause", "Note"], [26, 60, 16, 30])
    for r, (a, b, _c) in enumerate([("Budget flexibility between lines", "10% of line without prior approval; above needs written amendment", ""), ("Reporting frequency", "Quarterly financial and narrative, 30 days after quarter end", ""), ("Ineligible costs", "VAT where recoverable, fines, alcohol, gifts, costs outside project period, unapproved international travel", ""), ("Procurement thresholds", "Follow SOC policy or donor's, whichever is stricter", ""), ("Audit rights and retention", "7 years from final report", ""), ("Asset disposal", "Donor approval before transfer or sale of assets above USD 500", ""), ("Exchange rate", "Rate on date of transaction, source recorded", "")], 6):
        put(ws3, r, 1, a); put(ws3, r, 2, b, inp=True); put(ws3, r, 3, "", inp=True); put(ws3, r, 4, "", inp=True)
    save(wb, "finance", "budget-worksheet.xlsx")


# ---------------------------------------------------------------- Expense claim
def expense():
    wb = Workbook()
    ws = wb.active
    ws.title = "Expense claim"
    title(ws, "Expense Claim Form", "Attach receipts numbered to match the Receipt ref column. Approver is determined by the total in USD.")
    for r, (k, v) in enumerate([("Claim ID", "EXP-2026-0142"), ("Claimant", "Example Name A"), ("Staff ID", "S-001"), ("Project code", "UNHCR-PPA-2026"), ("Purpose", "PDM round 2 field visits, Ninewa"), ("Date submitted", "2026-09-05"), ("Advance received (USD)", 300)], 5):
        put(ws, r, 1, k); put(ws, r, 2, v, inp=True, fmt="#,##0.00" if isinstance(v, (int, float)) else None)
    header(ws, 13, ["#", "Date", "Description", "Budget line", "Cost category", "Currency", "Amount", "Exchange rate to USD", "USD amount", "Receipt ref", "Receipt attached (Y/N)"], [5, 12, 40, 10, 14, 9, 12, 12, 12, 12, 12])
    items = [("2026-09-01", "Vehicle hire Mosul-Sinjar return", "3.2", "Operations", "IQD", 180000, 0.00076, "R-01", "Y"), ("2026-09-01", "Enumerator lunch x6", "2.2", "Programme", "IQD", 60000, 0.00076, "R-02", "Y"), ("2026-09-02", "Printing consent forms", "2.2", "Programme", "USD", 18, 1, "R-03", "Y")]
    for r, (d, desc, bl, cat, cur, amt, fx, ref, att) in enumerate(items, 14):
        put(ws, r, 1, r - 13); put(ws, r, 2, d, inp=True); put(ws, r, 3, desc, inp=True); put(ws, r, 4, bl, inp=True); put(ws, r, 5, cat, inp=True); put(ws, r, 6, cur, inp=True); put(ws, r, 7, amt, inp=True, fmt="#,##0.00"); put(ws, r, 8, fx, inp=True, fmt="0.000000"); put(ws, r, 9, f"=G{r}*H{r}", fmt="#,##0.00"); put(ws, r, 10, ref, inp=True); put(ws, r, 11, att, inp=True)
    for r in range(17, 22):
        put(ws, r, 1, r - 13)
        for c in range(2, 12):
            put(ws, r, c, "", inp=True)
        put(ws, r, 9, f"=IF(G{r}=\"\",\"\",G{r}*H{r})", fmt="#,##0.00")
    put(ws, 23, 3, "Total claimed (USD)"); put(ws, 23, 9, "=SUM(I14:I21)", fmt="#,##0.00")
    put(ws, 24, 3, "Less advance"); put(ws, 24, 9, "=B11", fmt="#,##0.00")
    put(ws, 25, 3, "Due to / (from) claimant"); put(ws, 25, 9, "=I23-I24", fmt="#,##0.00;(#,##0.00);-")
    put(ws, 26, 3, "Receipts missing"); put(ws, 26, 9, "=COUNTIF(K14:K21,\"N\")")
    put(ws, 27, 3, "Required approver"); put(ws, 27, 9, "=IF(I23<=1000,\"Project Manager\",IF(I23<=5000,\"Finance Manager\",IF(I23<=25000,\"Operations Director\",\"Executive Director\")))")
    ws.merge_cells("I27:K27")
    for r, k in enumerate(["Claimant signature and date", "Line manager check (budget line, purpose)", "Finance review (receipts, rates, coding)", "Approver signature and date", "Paid by / date / reference"], 29):
        put(ws, r, 1, k); ws.merge_cells(f"A{r}:C{r}"); put(ws, r, 4, "", inp=True); ws.merge_cells(f"D{r}:K{r}")
    ws["A35"] = "Rules: claims within 10 days of expense. Cash payments capped at USD 500 per transaction. Exchange rate is the rate on the transaction date, source recorded. Claims without receipts above USD 20 are not reimbursed without a signed missing-receipt declaration."
    ws["A35"].font = NOTE
    save(wb, "finance", "expense-claim-form.xlsx")


# ---------------------------------------------------------------- Venue checklist
def venue():
    wb = Workbook()
    ws = wb.active
    ws.title = "Venue evaluation"
    title(ws, "Venue Evaluation Checklist", "Score each venue 1-5 per criterion. Weighted score calculated. Site visit required above 30 participants or USD 3,000.")
    for r, (k, v) in enumerate([("Event", "Teacher PSS training, cohort 3"), ("Project", "UNICEF-PCA-2026"), ("Dates", "2026-10-12 to 2026-10-14"), ("Participants", 35), ("Budget ceiling (USD)", 4500), ("Evaluated by", "OD, PM, Logistics")], 5):
        put(ws, r, 1, k); put(ws, r, 2, v, inp=True)
    header(ws, 12, ["Criterion", "Weight %", "What to check", "Venue A score", "Venue B score", "Venue C score"], [34, 9, 60, 12, 12, 12])
    crit = [
        ("Security and access", 25, "Location risk rating, controlled entry, parking, proximity to checkpoints, evacuation route, previous incidents"),
        ("Room and equipment suitability", 20, "Capacity with U-shape seating, natural light, AC or heating, projector, sound, stable internet, breakout space"),
        ("Cost vs benchmark", 20, "Per-person day rate against preferred venue list benchmark; inclusions (coffee breaks, lunch, stationery)"),
        ("Accessibility and inclusion", 15, "Step-free access, accessible toilets, separate prayer and rest space where required, women-only facilities where requested"),
        ("Catering and hygiene", 10, "Kitchen hygiene, dietary options, water, cleanliness of toilets"),
        ("Cancellation terms and past performance", 10, "Free cancellation window, deposit terms, SOC or partner experience with venue"),
    ]
    for r, (c, w, chk) in enumerate(crit, 13):
        put(ws, r, 1, c); put(ws, r, 2, w / 100, inp=True, fmt="0%"); put(ws, r, 3, chk)
        for col, s in zip((4, 5, 6), (4, 3, 5)):
            put(ws, r, col, s if r == 13 else 3, inp=True)
    put(ws, 19, 1, "Weight check"); put(ws, 19, 2, "=SUM(B13:B18)", fmt="0%")
    put(ws, 20, 1, "Weighted score (max 5)")
    for col in (4, 5, 6):
        L = get_column_letter(col); put(ws, 20, col, f"=SUMPRODUCT($B$13:$B$18,{L}13:{L}18)", fmt="0.00")
    put(ws, 21, 1, "Quoted total (USD)"); put(ws, 21, 4, 4200, inp=True, fmt="#,##0"); put(ws, 21, 5, 3600, inp=True, fmt="#,##0"); put(ws, 21, 6, 4900, inp=True, fmt="#,##0")
    put(ws, 22, 1, "Within budget ceiling?")
    for col in (4, 5, 6):
        L = get_column_letter(col); put(ws, 22, col, f"=IF({L}21<=$B$9,\"Yes\",\"No\")")
    put(ws, 23, 1, "Score per USD 1,000")
    for col in (4, 5, 6):
        L = get_column_letter(col); put(ws, 23, col, f"=IF({L}21=0,0,{L}20/({L}21/1000))", fmt="0.00")
    put(ws, 25, 1, "Venue names"); put(ws, 25, 4, "Venue A", inp=True); put(ws, 25, 5, "Venue B", inp=True); put(ws, 25, 6, "Venue C", inp=True)
    put(ws, 26, 1, "Site visit done (Y/N), date, by"); put(ws, 26, 4, "", inp=True); put(ws, 26, 5, "", inp=True); put(ws, 26, 6, "", inp=True)
    put(ws, 27, 1, "Recommendation and rationale"); put(ws, 27, 2, "", inp=True); ws.merge_cells("B27:F27"); ws.row_dimensions[27].height = 48
    put(ws, 28, 1, "Approved by (OD) and date"); put(ws, 28, 2, "", inp=True); ws.merge_cells("B28:F28")
    ws2 = wb.create_sheet("Quote comparison")
    title(ws2, "Quote comparison sheet (procurement USD 1,000 to 25,000)")
    header(ws2, 5, ["Item", "Spec", "Qty", "Supplier 1 unit", "Supplier 1 total", "Supplier 2 unit", "Supplier 2 total", "Supplier 3 unit", "Supplier 3 total", "Lowest compliant", "Note"], [22, 30, 6, 12, 12, 12, 12, 12, 12, 14, 24])
    for r, (i, s, q, a, b, c) in enumerate([("Training kits", "Bag, notebook, pen, printed manual", 35, 9.5, 8.0, 11.0), ("Projector hire", "Full HD, 3 days", 3, 40, 45, 38)], 6):
        put(ws2, r, 1, i, inp=True); put(ws2, r, 2, s, inp=True); put(ws2, r, 3, q, inp=True); put(ws2, r, 4, a, inp=True, fmt="#,##0.00"); put(ws2, r, 5, f"=C{r}*D{r}", fmt="#,##0.00"); put(ws2, r, 6, b, inp=True, fmt="#,##0.00"); put(ws2, r, 7, f"=C{r}*F{r}", fmt="#,##0.00"); put(ws2, r, 8, c, inp=True, fmt="#,##0.00"); put(ws2, r, 9, f"=C{r}*H{r}", fmt="#,##0.00"); put(ws2, r, 10, f"=MIN(E{r},G{r},I{r})", fmt="#,##0.00"); put(ws2, r, 11, "", inp=True)
    put(ws2, 9, 1, "Totals"); put(ws2, 9, 5, "=SUM(E6:E8)", fmt="#,##0.00"); put(ws2, 9, 7, "=SUM(G6:G8)", fmt="#,##0.00"); put(ws2, 9, 9, "=SUM(I6:I8)", fmt="#,##0.00")
    put(ws2, 11, 1, "Committee decision and rationale"); put(ws2, 2 + 9, 2, "", inp=True); ws2.merge_cells("B11:K11")
    put(ws2, 12, 1, "Committee members and signatures (3)"); put(ws2, 12, 2, "", inp=True); ws2.merge_cells("B12:K12")
    save(wb, "logistics", "venue-evaluation-checklist.xlsx")


# ---------------------------------------------------------------- Registers
def registers():
    wb = Workbook()
    ws = wb.active
    ws.title = "Contracts"
    title(ws, "Operations Registers", "One workbook, one owner per sheet. Feeds the dashboard. 'Days to end' uses the As-of date in B5.")
    put(ws, 5, 1, "As of"); put(ws, 5, 2, "2026-09-08", inp=True)
    header(ws, 7, ["Contract ID", "Type (Employment / Consultant / Supplier / Venue / Donor)", "Party", "Project", "Value (USD)", "Start", "End", "Notice days", "Renewal count", "Signatory", "Days to end", "Alert", "File link"], [12, 24, 22, 16, 12, 12, 12, 10, 10, 12, 10, 12, 30])
    ex = [("CT-2026-031", "Employment", "Example Name A", "UNHCR-PPA-2026", 21600, "2026-02-01", "2027-01-31", 30, 0, "OD"), ("CT-2026-047", "Employment", "Example Name B", "UNHCR-PPA-2026", 4400, "2026-06-01", "2026-09-30", 15, 3, "OD"), ("CT-2026-052", "Supplier", "Cash delivery agent X", "UNHCR-PPA-2026", 2400, "2026-03-01", "2026-12-31", 30, 0, "ED"), ("CT-2026-060", "Donor", "UNICEF PCA", "UNICEF-PCA-2026", 180000, "2026-04-01", "2027-03-31", 60, 0, "ED")]
    for r, row in enumerate(ex, 8):
        for c, v in enumerate(row, 1):
            put(ws, r, c, v, inp=True, fmt="#,##0" if c == 5 else None)
        put(ws, r, 11, f"=DATEVALUE(G{r})-DATEVALUE($B$5)")
        put(ws, r, 12, f"=IF(K{r}<0,\"Expired\",IF(K{r}<=45,\"Renew/close\",\"OK\"))")
        put(ws, r, 13, "", inp=True)
    ws2 = wb.create_sheet("Procurement")
    title(ws2, "Procurement register")
    header(ws2, 5, ["PR ID", "Date", "Project", "Description", "Est. value (USD)", "Route", "Quotes received", "Supplier", "PO number", "PO date", "GRN date", "Invoice paid date", "Status", "Days open"], [12, 12, 16, 30, 12, 22, 8, 20, 12, 12, 12, 12, 12, 10])
    ex = [("PR-2026-088", "2026-08-12", "UNICEF-PCA-2026", "Training kits x35", 350, None, 1, "Stationery Co", "PO-2026-071", "2026-08-14", "2026-08-20", "2026-08-28", "Closed"), ("PR-2026-091", "2026-08-25", "UNHCR-PPA-2026", "Vehicle hire Sep-Dec", 3600, None, 3, "Transport Ltd", "PO-2026-074", "2026-09-01", "", "", "Open")]
    for r, row in enumerate(ex, 6):
        for c, v in enumerate(row, 1):
            if c == 6:
                put(ws2, r, c, f"=IF(E{r}<1000,\"1 quote\",IF(E{r}<=5000,\"3 quotes\",IF(E{r}<=25000,\"RFQ + committee\",\"Tender + ED\")))")
            else:
                put(ws2, r, c, v, inp=True, fmt="#,##0" if c == 5 else None)
        put(ws2, r, 14, f"=IF(M{r}=\"Closed\",DATEVALUE(L{r})-DATEVALUE(B{r}),DATEVALUE(Contracts!$B$5)-DATEVALUE(B{r}))")
    ws3 = wb.create_sheet("Travel")
    title(ws3, "Travel and embassy register")
    header(ws3, 5, ["Trip ID", "Traveller", "Project", "Destination", "Purpose", "Depart", "Return", "Authorised by", "Visa required", "Embassy appointment", "Visa status", "Passport custody receipt", "Advance (USD)", "Settlement date", "Days to settle", "Alert"], [10, 18, 16, 14, 24, 12, 12, 12, 8, 14, 14, 12, 10, 12, 10, 12])
    ex = [("TR-2026-019", "Example Name A", "UNHCR-PPA-2026", "Amman", "Donor workshop", "2026-09-20", "2026-09-24", "OD", "Y", "2026-09-02", "Issued", "PC-014", 450, "", None), ("TR-2026-015", "Example Name B", "UNHCR-PPA-2026", "Sinjar", "PDM round 2", "2026-08-30", "2026-09-02", "PM", "N", "", "n/a", "", 120, "", None)]
    for r, row in enumerate(ex, 6):
        for c, v in enumerate(row[:14], 1):
            put(ws3, r, c, v, inp=True, fmt="#,##0" if c == 13 else None)
        put(ws3, r, 15, f"=IF(N{r}=\"\",DATEVALUE(Contracts!$B$5)-DATEVALUE(G{r}),DATEVALUE(N{r})-DATEVALUE(G{r}))")
        put(ws3, r, 16, f"=IF(N{r}=\"\",IF(O{r}>10,\"Advance overdue\",\"Open\"),\"Settled\")")
    ws4 = wb.create_sheet("Reports due")
    title(ws4, "Donor reporting calendar")
    header(ws4, 5, ["Project", "Report", "Donor due", "Internal due (5 wd before)", "Owner", "Status", "Days to donor due", "Alert"], [16, 28, 12, 16, 14, 12, 12, 12])
    ex = [("UNHCR-PPA-2026", "Q3 narrative and financial", "2026-10-30", "2026-10-23", "PM / FM", "Not started"), ("UNICEF-PCA-2026", "Semi-annual progress", "2026-10-15", "2026-10-08", "PM", "Drafting")]
    for r, row in enumerate(ex, 6):
        for c, v in enumerate(row, 1):
            put(ws4, r, c, v, inp=True)
        put(ws4, r, 7, f"=DATEVALUE(C{r})-DATEVALUE(Contracts!$B$5)")
        put(ws4, r, 8, f"=IF(F{r}=\"Submitted\",\"Done\",IF(G{r}<=10,\"Due soon\",\"OK\"))")
    ws5 = wb.create_sheet("Assets")
    title(ws5, "Asset register (assets above USD 500)")
    header(ws5, 5, ["Asset tag", "Description", "Project / donor", "Purchase date", "Cost (USD)", "Location", "Custodian", "Condition", "Last verified", "Disposal approval"], [10, 26, 16, 12, 10, 12, 16, 10, 12, 16])
    put(ws5, 6, 1, "SOC-IQ-0041", inp=True); put(ws5, 6, 2, "Laptop 14in", inp=True); put(ws5, 6, 3, "UNHCR-PPA-2026", inp=True); put(ws5, 6, 4, "2026-02-03", inp=True); put(ws5, 6, 5, 820, inp=True, fmt="#,##0"); put(ws5, 6, 6, "Erbil", inp=True); put(ws5, 6, 7, "S-001", inp=True); put(ws5, 6, 8, "Good", inp=True); put(ws5, 6, 9, "2026-06-30", inp=True); put(ws5, 6, 10, "", inp=True)
    save(wb, "finance", "operations-registers.xlsx")


if __name__ == "__main__":
    glossary(); itt(); rubric(); onboarding(); payroll(); budget(); expense(); venue(); registers()
