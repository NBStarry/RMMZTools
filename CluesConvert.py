import pandas as pd
HEADER = [
    'id', 
    'animationId', 
    'consumable', 
    'description', 
    'effects', 
    'hitType', 
    'iconIndex', 
    'itypeId', 
    'name', 
    'note', 
    'occasion', 
    'price', 
    'repeats', 
    'scope', 
    'speed', 
    'successRate', 
    'tpGain', 
    'damage_critical', 
    'damage_elementId', 
    'damage_formula', 
    'damage_type', 
    'damage_variance'
    ]

PROJECT_DIR = 'D:\OneDrive - sjtu.edu.cn\文档\RMMZ\斯泰尔斯庄园奇案'

def read_excel(file_path):
    return pd.read_excel(file_path)

def main():
    # 读取线索汇总表
    origin_df = read_excel('D:\OneDrive - sjtu.edu.cn\文档\RMMZ\线索汇总.xlsx')

    # 生成json
    output_df = pd.DataFrame(columns=HEADER)
    output_df['name'] = origin_df['Name']
    output_df['description'] = origin_df['Description']
    output_df['note'] = origin_df['Note']
    output_df.fillna(0, inplace=True)
    output_df['id'] = [i for i in range(1, len(origin_df) + 1)]
    output_df['occasion'] = 3
    output_df['itypeId'] = 1
    output_df['repeats'] = 1
    output_df['scope'] = 7
    output_df['successRate'] = 100

    # 调整格式与RMMZ匹配并输出到文件
    output_df.to_json('D:\OneDrive - sjtu.edu.cn\文档\RMMZ\\clues.json', orient='records', force_ascii=False)
    with open('D:\OneDrive - sjtu.edu.cn\文档\RMMZ\\clues.json', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content[:1] + 'null,' + content[1:]

    with open('D:\OneDrive - sjtu.edu.cn\文档\RMMZ\\clues.json', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    main()