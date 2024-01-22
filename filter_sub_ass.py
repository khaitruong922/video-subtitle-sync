import os
from typing import List

def filter_sub(folder_path: str, types: List[str]):
    # Ensure the folder path is valid
    if not os.path.isdir(folder_path):
        print(f"Error: '{folder_path}' is not a valid directory.")
        return

    ass_files = [file for file in os.listdir(folder_path) if file.endswith(".ass")]

    for file_name in ass_files:
        file_path = os.path.join(folder_path, file_name)

        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        filtered_lines = []
        for line in lines:
            if line.startswith("Dialogue: "):
                parts = line.split(',')
                for t in types:
                    if parts[3].strip() == t.strip():
                        filtered_lines.append(line)
                        break
            else:
                filtered_lines.append(line)
        # Write the filtered lines back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.writelines(filtered_lines)

        print(f"Filtered '{file_name}'")

if __name__ == "__main__":
    folder_path = input("Enter the folder path containing .ass files: ")
    types = input("Enter the subtitle types to keep, separated by comma: ").split(',')

    filter_sub(folder_path, types)
