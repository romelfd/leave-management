# AWS deployment sketch (stretch goal — not deployed, talking points only)

How this app would map onto the AWS services named in the JD (EC2, S3, IAM, VPC, ASG,
Security Groups):

- **VPC**: one VPC, public subnet for the load balancer, private subnets for the EC2
  instances and RDS — the API and DB should never be directly internet-reachable.
- **EC2 + Auto Scaling Group**: the Node/Express API runs on EC2 instances inside an ASG,
  behind an Application Load Balancer. ASG scales on CPU or request count; instances are
  stateless (no session data on disk) so any instance can serve any request.
- **RDS (MySQL)**: managed MySQL in a private subnet, replacing the local `schema.sql`
  setup. Multi-AZ for failover if this were graded on HA awareness.
- **S3**: hosts the built React/Next.js static assets (or, for a full Next.js SSR app,
  the frontend would run on EC2/ECS instead of S3 — worth knowing the distinction:
  static export → S3 + CloudFront, SSR → compute).
- **IAM**: least-privilege roles — the EC2 instance role gets only the permissions it
  needs (e.g. reading a DB credential from Secrets Manager), not broad `*` access.
- **Security Groups**: layered — ALB SG allows 443 from the internet; EC2 SG allows
  traffic only from the ALB SG; RDS SG allows traffic only from the EC2 SG. Nothing
  talks directly to the database from outside the app tier.

This is the shape an interviewer is checking for when they ask "how would you deploy
this" — the tiering and the SG chain matter more than exact service names.
