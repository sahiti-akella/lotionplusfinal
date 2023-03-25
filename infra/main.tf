terraform {
 required_providers {
   aws = {
     version = ">= 4.0.0"
     source  = "hashicorp/aws"
   }
 }
}


# specify the provider region
provider "aws" {
 region = "ca-central-1"
}


#Delete_Note
resource "aws_iam_role" "lambda_delete_note" {
 name               = "iam-for-lambda-delete-note"
 assume_role_policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
     {
       Action = "sts:AssumeRole"
       Effect = "Allow"
       Principal = {
         Service = "lambda.amazonaws.com"
       }
     }
   ]
 })
}


data "archive_file" "delete-note-30140959-archive" {
 type = "zip"
 source_file = "../functions/delete-note/main.py"
 output_path = "delete_note.zip"
}


resource "aws_lambda_function" "lambda_delete_note" {
 role             = aws_iam_role.lambda_delete_note.arn
 function_name    = "delete-note-30140959"
 handler          = "main.lambda_handler"
 filename         = "delete_note.zip"
 source_code_hash = data.archive_file.delete-note-30140959-archive.output_base64sha256
 runtime          = "python3.9"
}


resource "aws_iam_policy" "dynamodb_delete_policy" {
 name = "dynamodb-delete-policy"


 policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
     {
       Action = "dynamodb:DeleteItem"
       Effect = "Allow"
       Resource = aws_dynamodb_table.lotion-30143555.arn
     },
     {
       Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
       Effect = "Allow"
       Resource = "arn:aws:logs:*:*:*"
     },


   ]
 })
}


resource "aws_iam_role_policy_attachment" "lambda_dynamodb_delete_policy" {
 policy_arn = aws_iam_policy.dynamodb_delete_policy.arn
 role       = aws_iam_role.lambda_delete_note.name
}


resource "aws_lambda_function_url" "delete_note_url" {
 function_name      = aws_lambda_function.lambda_delete_note.function_name
 authorization_type = "NONE"


 cors {
   allow_credentials = true
   allow_origins     = ["*"]
   allow_methods     = ["DELETE"]
   allow_headers     = ["*"]
   expose_headers    = ["keep-alive", "date"]
 }
}


output "delete_note_url" {
 value = aws_lambda_function_url.delete_note_url.function_url
}


#Get_Note


resource "aws_iam_role" "lambda_get_notes" {
 name               = "iam-for-lambda-get-notes"
 assume_role_policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
     {
       Action = "sts:AssumeRole"
       Effect = "Allow"
       Principal = {
         Service = "lambda.amazonaws.com"
       }
     }
   ]
 })
}




data "archive_file" "get-notes-30140959-archive" {
 type = "zip"
 source_file = "../functions/get-notes/main.py"
 output_path = "get_notes.zip"
}


resource "aws_lambda_function" "lambda_get_notes" {
 role             = aws_iam_role.lambda_get_notes.arn
 function_name    = "get-notes-30140959"
 handler          = "main.lambda_handler"
 filename         = "get_notes.zip"
 source_code_hash = data.archive_file.get-notes-30140959-archive.output_base64sha256
 runtime          = "python3.9"
}


resource "aws_iam_policy" "dynamodb_get_policy" {
 name = "dynamodb-get-policy"


 policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
      {
       Action = ["dynamodb:*", "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
       Effect = "Allow"
       Resource = aws_dynamodb_table.lotion-30143555.arn
     }
   ]
 })
}


resource "aws_iam_role_policy_attachment" "lambda_dynamodb_get_policy" {
 policy_arn = aws_iam_policy.dynamodb_get_policy.arn
 role       = aws_iam_role.lambda_get_notes.name
}


resource "aws_lambda_function_url" "get_notes_url" {
 function_name      = aws_lambda_function.lambda_get_notes.function_name
 authorization_type = "NONE"


 cors {
   allow_credentials = true
   allow_origins     = ["*"]
   allow_methods     = ["GET"]
   allow_headers     = ["*"]
   expose_headers    = ["keep-alive", "date"]
 }
}


output "get_notes_url" {
 value = aws_lambda_function_url.get_notes_url.function_url
}


#Save_Note


resource "aws_iam_role" "lambda_save_note" {
 name               = "iam-for-lambda-save-note"
 assume_role_policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
     {
       Action = "sts:AssumeRole"
       Effect = "Allow"
       Principal = {
         Service = "lambda.amazonaws.com"
       }
     }
   ]
 })
}


data "archive_file" "save-note-30140959-archive" {
 type = "zip"
 source_file = "../functions/save-note/main.py"
 output_path = "save_note.zip"
}


resource "aws_lambda_function" "lambda_save_note" {
 role             = aws_iam_role.lambda_save_note.arn
 function_name    = "save-note-30140959"
 handler          = "main.lambda_handler"
 filename         = "save_note.zip"
 source_code_hash = data.archive_file.save-note-30140959-archive.output_base64sha256


 runtime = "python3.9"
}


resource "aws_iam_policy" "dynamodb_save_policy" {
 name = "dynamodb-save-policy"


 policy = jsonencode({
   Version = "2012-10-17"
   Statement = [
     {
       Action = ["dynamodb:*", "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
       Effect = "Allow"
       Resource = aws_dynamodb_table.lotion-30143555.arn
     }
   ]
 })
}


resource "aws_iam_role_policy_attachment" "lambda_dynamodb_save_policy" {
 role       = aws_iam_role.lambda_save_note.name
 policy_arn = aws_iam_policy.dynamodb_save_policy.arn
}


resource "aws_lambda_function_url" "save_note_url" {
 function_name      = aws_lambda_function.lambda_save_note.function_name
 authorization_type = "NONE"


 cors {
   allow_credentials = true
   allow_origins     = ["*"]
   allow_methods     = ["POST"]
   allow_headers     = ["*"]
   expose_headers    = ["keep-alive", "date"]
 }
}


output "save_note_url" {
 value = aws_lambda_function_url.save_note_url.function_url
}


resource "aws_dynamodb_table" "lotion-30143555" {
 name         = "lotion-30143555"
 billing_mode = "PROVISIONED"


 # up to 8KB read per second (eventually consistent)
 read_capacity = 1


 # up to 1KB per second
 write_capacity = 1


 # we only need a student id to find an item in the table; therefore, we
 # don't need a sort key here
 hash_key = "email"
 range_key = "id"


 # the hash_key data type is string
 attribute {
   name = "email"
   type = "S"
 }


 attribute {
   name = "id"
   type = "S"
 }
}
