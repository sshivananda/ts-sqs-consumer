cd integration-test
TMPDIR=/private$TMPDIR docker-compose up -d
terraform init
terraform apply -auto-approve
cd ..
npm run integration-test
cd integration-test
terraform destroy --auto-approve
