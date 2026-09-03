import io
import matplotlib.pyplot as plt
import pandas as pd

# നിങ്ങൾ നൽകിയ ഡാറ്റയുടെ ഒരു സാമ്പിൾ ഭാഗം (ടെസ്റ്റിംഗിനായി)
raw_data = """ID,Title,Category,Problem Creater's Organization
SIH1525,Software for analysis...,Software,Indian Space Research Organisation (ISRO)
SIH1524,DNS Filtering Service...,Software,Indian Space Research Organisation (ISRO)
SIH1516,Grievance lodging...,Software,Ministry of Housing and Urban Affairs
SIH1515,Management of street parking,Software,Ministry of Housing and Urban Affairs
SIH1514,Water Supply Distribution...,Software,Ministry of Housing and Urban Affairs
SIH1511,Real time Knowledge of ore...,Hardware,Ministry of Mines
SIH1507,Dislodgement of belt conveyor,Hardware,Ministry of Mines"""

# 1. ഡാറ്റ റീഡ് ചെയ്യുന്നു
# ശ്രദ്ധിക്കുക: നിങ്ങളുടെ കമ്പ്യൂട്ടറിലുള്ള മുഴുവൻ ഫയൽ റീഡ് ചെയ്യാൻ df = pd.read_csv('your_file.csv') എന്ന് നൽകുക.
df = pd.read_csv(io.StringIO(raw_data))

# 2. ഓരോ ഓർഗനൈസേഷന്റെയും പ്രോബ്ലങ്ങളുടെ എണ്ണം കണക്കാക്കുന്നു (Value Counts)
org_counts = df["Problem Creater's Organization"].value_counts()

# 3. ഗ്രാഫ് നിർമ്മിക്കുന്നു
plt.figure(figsize=(10, 5))  # ഗ്രാഫിന്റെ വലിപ്പം ക്രമീകരിക്കുന്നു
org_counts.plot(kind="bar", color="skyblue", edgecolor="black")

# 4. ഗ്രാഫിന്റെ തലക്കെട്ടുകളും ലേബലുകളും നൽകുന്നു
plt.title("Number of Problem Statements by Organization", fontsize=14, fontweight="bold")
plt.xlabel("Organization", fontsize=12)
plt.ylabel("Count", fontsize=12)
plt.xticks(rotation=45, ha="right")  # പേരുകൾ ചരിഞ്ഞു നിൽക്കാൻ

# 5. ഗ്രാഫ് കൃത്യമായി ക്രമീകരിച്ച് സ്ക്രീനിൽ കാണിക്കുന്നു
plt.tight_layout()
plt.show()
