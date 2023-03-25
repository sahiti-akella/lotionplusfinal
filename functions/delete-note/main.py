import json
import boto3

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30143555")

def lambda_handler(event, context):
    email = event["queryStringParameters"]["email"]
    id = event["queryStringParameters"]["id"]
    try:
        response = table.delete_item(
        Key = {
        "email": email,
        "id": id
        }
        )
        print(response['ResponseMetadata']['HTTPStatusCode'])


    except Exception as exp:
        print(f"exception:{exp}")
        return{
            "statusCode": 401,
            "body": json.dumps({
            "message": str(exp)
            })
        }
