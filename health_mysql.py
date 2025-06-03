import pandas as pd
import numpy as np
import mysql.connector
from mysql.connector import Error
import traceback

config = {
    'user': 'root',
    'password': '123456',
    'host': 'localhost',
    'database': 'health_data',
    'raise_on_warnings': True,
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

excel_path = r'C:\Users\86181\Desktop\文件夹\专业课作业\问题求解实战\数据库数据.xlsx'

def convert_numpy_types(obj):
    """将numpy数据类型转换为Python原生类型"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif obj is None or obj == '':
        return None
    return obj

def process_sheet(sheet_name, table_name, columns_mapping=None, dtype=None):
    conn = None
    try:
        # 1. 读取Excel数据
        if sheet_name == "敏感词":
            df = pd.read_excel(
                excel_path,
                sheet_name=sheet_name,
                header=None,
                names=["keyword"],
                dtype=dtype
            )
        else:
            df = pd.read_excel(
                excel_path,
                sheet_name=sheet_name,
                header=0,
                dtype=dtype
            )

        # 2. 删除全空行
        df = df.dropna(how='all')
        
        # 3. 特殊表处理
        if sheet_name == "检测项目表":
            df['item_name'] = df['item_name'].fillna('未命名项目')
        elif sheet_name == "辅料":
            df['restriction'] = df['restriction'].fillna('无限制')
        elif sheet_name == "原料":
            # 特殊处理：将NaN转换为None
            df['可替代食品名称'] = df['可替代食品名称'].replace({np.nan: None})
        
        # 4. 统一将NaN转换为None
        df = df.replace({np.nan: None})
        
        # 5. 列名映射
        if columns_mapping:
            df.rename(columns=columns_mapping, inplace=True)
        
        # 6. 转换numpy类型到Python原生类型 - 避免applymap的警告
        for col in df.columns:
            df[col] = df[col].map(convert_numpy_types)

        # 7. 连接数据库
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        
        # 8. 构建SQL语句（使用反引号转义中文列名）
        quoted_columns = [f"`{col}`" for col in df.columns]
        columns = ', '.join(quoted_columns)
        placeholders = ', '.join(['%s'] * len(df.columns))
        
        # 9. 定义主键映射
        primary_keys = {
            "检测机构表": "id",
            "检测项目表": "id",
            "原料": "中文名",
            "辅料": "id",
            "备案号": "备案号",
            "敏感词": "keyword"
        }
        
        # 10. 构建SQL语句 - 使用新语法解决VALUES()弃用问题
        if table_name in primary_keys:
            pk = primary_keys[table_name]
            # 构建ON DUPLICATE KEY UPDATE子句 - 使用别名语法
            update_cols = []
            for col in df.columns:
                if col != pk:
                    # 使用别名语法而不是VALUES()函数
                    update_cols.append(f"`{col}` = new.`{col}`")
            
            # 处理敏感词表特殊情况（只有主键列）
            if not update_cols:
                update_cols = [f"`{pk}` = new.`{pk}`"]
                
            update_clause = ", ".join(update_cols)
            
            sql = f"""
                INSERT INTO `{table_name}` ({columns}) 
                VALUES ({placeholders}) AS new
                ON DUPLICATE KEY UPDATE {update_clause}
            """
        else:
            sql = f"INSERT INTO `{table_name}` ({columns}) VALUES ({placeholders})"
        
        # 11. 准备数据
        data = [tuple(row) for row in df.itertuples(index=False)]
        
        # 12. 执行批量插入
        cursor.executemany(sql, data)
        conn.commit()
        
        print(f"[SUCCESS] 表 {table_name} 导入成功，插入/更新 {len(data)} 行")
        

    except Error as e:
        print(f"[ERROR] 数据库错误: {e}")
        if conn:
            conn.rollback()
        # 打印出错的SQL语句
        if 'sql' in locals():
            print(f"出错SQL: {sql}")
    except Exception as e:
        print(f"[ERROR] 其他错误: {e}")
        traceback.print_exc()
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    # 清空所有表（按依赖顺序）
    tables_to_clear = ["检测项目表", "检测机构表", "辅料", "备案号", "敏感词", "原料"]
    
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        # 禁用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        for table in tables_to_clear:
            try:
                cursor.execute(f"TRUNCATE TABLE `{table}`")
                print(f"已清空表: {table}")
            except Error as e:
                print(f"清空表 {table} 错误: {e}")
        conn.commit()
        # 启用外键检查
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    except Error as e:
        print(f"清空表错误: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

    # 处理各表
    tables = [
        {"sheet": "检测机构表", "table": "检测机构表", "dtype": {"id": "Int64", "name": str}},
        {"sheet": "检测项目表", "table": "检测项目表", "dtype": {"id": "Int64", "institution_id": "Int64", "item_name": str}},
        {"sheet": "原料", "table": "原料", "dtype": {"中文名": str, "可替代食品名称": str, "更新日期": str}},
        {"sheet": "辅料", "table": "辅料", "dtype": {"id": "Int64", "name": str, "restriction": str}},
        {"sheet": "备案号", "table": "备案号", "dtype": {"保健品": str, "备案号": str}},
        {"sheet": "敏感词", "table": "敏感词", "dtype": {"keyword": str}}
    ]
    
    for table in tables:
        print(f"\n{'='*50}")
        print(f"开始处理: {table['sheet']} → {table['table']}")
        print(f"{'='*50}")
        process_sheet(
            sheet_name=table["sheet"],
            table_name=table["table"],
            dtype=table["dtype"]
        )
