import json
import boto3
#from google.oauth2 import id_token
#from google.auth.transport import requests
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("lotion-30143555")


def lambda_handler(event, context):
   email = event["queryStringParameters"]["email"]
   #access_token = event["headers"].get("access_token")
   #try:
       #id_info = id_token.verify_oauth2_token(access_token, requests.Request())
      # if id_info["email"] != email:
           #raise ValueError("Token email and request email do not match")
      
   #except ValueError as e:
       #return {
           #"statusCode": 401,
          # "body": json.dumps({
               #"message": "Unauthorized: " + str(e)
          # })
      # }


   try:
       response = table.query(
           KeyConditionsExpression = Key("email").eq(email)
       )


       items = response["Items"]
       if(len(items) == 0):
               return []
       else:
            return items
  
      
   except Exception as exp:
       return {
           "statusCode": 401,
           "body": json.dumps({
               "message": str(exp)
           })
       }

