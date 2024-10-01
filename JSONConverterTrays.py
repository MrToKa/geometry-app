import json

def generate_sql_insert(json_file_path, output_file_path):
    try:
        # Read the JSON file
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)

        # Open the output text file
        with open(output_file_path, 'w') as output_file:
            # Iterate over each item entry in the JSON file
            for item in data:
                # Convert the JSON fields to match the database fields
                name = item.get("Name", "NULL")
                width = item.get("Width", "NULL")
                height = item.get("Height", "NULL")
                length = item.get("Length", "NULL")

                # Generate the SQL INSERT statement
                insert_statement = f"""
                INSERT INTO "Trays" ("Name", "Width", "Height", "Length") 
                VALUES ('{name}', {width}, {height}, {length});
                """

                # Write the SQL statement to the output file
                output_file.write(insert_statement.strip() + '\n')
        
        print(f"SQL statements successfully written to {output_file_path}")

    except Exception as e:
        print(f"Error processing file: {e}")

# Main program
if __name__ == "__main__":
    # Get JSON file path from the user
    json_file_path = "C:\\Users\\todor.chankov\\source\\repos\\geometry-app\\Trays_DB_Input.json"
    # Set output text file path
    output_file_path = "C:\\Users\\todor.chankov\\source\\repos\\geometry-app\\Trays_DB_Input.sql"
    
    # Generate SQL insert statements
    generate_sql_insert(json_file_path, output_file_path)
