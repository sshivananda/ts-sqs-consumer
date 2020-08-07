terraform {
  required_providers {
    aws = "= 2.64.0"
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "fake"
  secret_key                  = "fake"
  skip_requesting_account_id  = true
  skip_credentials_validation = true
  version                     = "~> 2.64"

  endpoints {
    sqs = "http://localhost:4566"
  }
}

resource "aws_sqs_queue" "test_queue_dlq" {
  name                              = "test_queue_dlq"
  delay_seconds                     = 1
  max_message_size                  = 2048
  message_retention_seconds         = 86400
  receive_wait_time_seconds         = 10
  kms_master_key_id                 = "alias/aws/sqs"
  kms_data_key_reuse_period_seconds = 300
}
resource "aws_sqs_queue" "test_queue" {
  name                              = "test_queue"
  delay_seconds                     = 1
  max_message_size                  = 2048
  message_retention_seconds         = 86400
  receive_wait_time_seconds         = 10
  kms_master_key_id                 = "alias/aws/sqs"
  kms_data_key_reuse_period_seconds = 300
  redrive_policy                    = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.test_queue_dlq.arn
    maxReceiveCount     = 1
  })
}