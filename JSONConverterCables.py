import json

def generate_sql_insert(json_file_path, output_file_path):
    try:
        # Read the JSON file
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)
        
        # Open the output text file
        with open(output_file_path, 'w') as output_file:
            # Iterate over each cable entry in the JSON file
            for cable in data:
                # Convert the JSON fields to match the database fields
                number = cable.get("NUMBER", "NULL")
                cable_information = cable.get("TYPE", "NULL")
                cable_name = cable.get("CABLE", "NULL")
                cable_type = cable.get("CablesTypes.Id", "NULL")
                from_device = cable.get("FROM", " ")
                to_device = cable.get("TO", " ")
                routing = cable.get("Routing", "NULL")

                # Create the SELECT statement for CableTypeId
                select_cable_type = f"(SELECT \"Id\" FROM \"CableTypes\" WHERE \"Id\" = '{cable_type}')"

                # Generate the SQL INSERT statement with the SELECT for CableTypeId
                insert_statement = f"""
                INSERT INTO "Cables" ("Number", "CableInformation", "CableName", "CableTypeId", "FromDevice", "ToDevice", "Routing") 
                VALUES ({number}, '{cable_information}', '{cable_name}', 
                {select_cable_type}, '{from_device}', '{to_device}', '{routing}');
                """
                
                # Write the SQL statement to the output file
                output_file.write(insert_statement.strip() + '\n')
        
        print(f"SQL statements successfully written to {output_file_path}")
    
    except Exception as e:
        print(f"Error processing file: {e}")


# Main program
if __name__ == "__main__":
    # Get JSON file path from the user
    json_file_path = "C:\\Users\\todor.chankov\\source\\repos\\geometry-app\\Cables_DB_Input.json"
    # Set output text file path
    output_file_path = "C:\\Users\\todor.chankov\\source\\repos\\geometry-app\\Cables_DB_output.sql"
    
    # Generate SQL insert statements
    generate_sql_insert(json_file_path, output_file_path)
