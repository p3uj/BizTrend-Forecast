import csv

data = [
    ["Year", "Industry Sector", "Number of Businesses", "Revenue (PHP Millions)", "Growth Rate (%)"],
    [2020, "Information & Communication", 18500, 320000, 8.5],
    [2020, "Health & Social Work", 21000, 280000, 7.2],
    [2020, "Education", 19500, 250000, 6.8],
    [2020, "Food & Beverage Services", 12000, 150000, 4.2],
    [2020, "Wholesale & Retail Trade", 13500, 160000, 3.8],
    [2020, "Manufacturing", 16000, 200000, 5.5],
    [2021, "Information & Communication", 19800, 350000, 9.2],
    [2021, "Health & Social Work", 22500, 310000, 8.1],
    [2021, "Education", 20800, 270000, 7.5],
    [2021, "Food & Beverage Services", 12800, 165000, 4.8],
    [2021, "Wholesale & Retail Trade", 14200, 175000, 4.2],
    [2021, "Manufacturing", 16800, 220000, 6.1],
    [2022, "Information & Communication", 21200, 385000, 9.8],
    [2022, "Health & Social Work", 24000, 340000, 8.7],
    [2022, "Education", 22100, 295000, 8.2],
    [2022, "Food & Beverage Services", 13600, 180000, 5.4],
    [2022, "Wholesale & Retail Trade", 15000, 190000, 4.8],
    [2022, "Manufacturing", 17600, 245000, 6.8],
    [2023, "Information & Communication", 22800, 425000, 10.1],
    [2023, "Health & Social Work", 25800, 375000, 9.3],
    [2023, "Education", 23600, 320000, 8.9],
    [2023, "Food & Beverage Services", 14500, 195000, 5.9],
    [2023, "Wholesale & Retail Trade", 15900, 205000, 5.2],
    [2023, "Manufacturing", 18500, 270000, 7.4],
    [2024, "Information & Communication", 24500, 470000, 10.5],
    [2024, "Health & Social Work", 27800, 415000, 9.8],
    [2024, "Education", 25200, 350000, 9.4],
    [2024, "Food & Beverage Services", 15500, 215000, 6.5],
    [2024, "Wholesale & Retail Trade", 16900, 225000, 5.8],
    [2024, "Manufacturing", 19500, 300000, 8.1],
    [2025, "Information & Communication", 26400, 520000, 11.2],
    [2025, "Health & Social Work", 30000, 460000, 10.4],
    [2025, "Education", 27000, 385000, 10.1],
    [2025, "Food & Beverage Services", 16600, 235000, 7.1],
    [2025, "Wholesale & Retail Trade", 18000, 245000, 6.3],
    [2025, "Manufacturing", 20600, 335000, 8.7]
]

with open('business_trends_sample.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(data)

print("CSV file created successfully!")
