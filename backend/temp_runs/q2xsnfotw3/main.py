
import sys
import io
import base64

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    
    _original_show = plt.show
    def custom_show(*args, **kwargs):
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        print(f"\n__IMAGE_BASE64__{img_str}__IMAGE_BASE64_END__\n")
        plt.clf()
        
    plt.show = custom_show
except ImportError:
    pass

import pandas as pd
import matplotlib.pyplot as plt

# ഫയൽ റീഡ് ചെയ്യുന്നു
df = pd.read_csv('sih_data.csv')

# ഓരോ കാറ്റഗറിയിലുമുള്ള പ്രോബ്ലംസിന്റെ എണ്ണം കണക്കാക്കുന്നു
category_counts = df['Category'].value_counts()
print("--- ഓരോ കാറ്റഗറിയിലുമുള്ള പ്രോബ്ലംസ് ---")
print(category_counts)

# ഒരു ബാർ ചാർട്ട് (Bar Chart) നിർമ്മിക്കുന്നു
category_counts.plot(kind='bar', color='skyblue')
plt.title('SIH Problems by Category')
plt.xlabel('Category')
plt.ylabel('Number of Problems')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.show()
