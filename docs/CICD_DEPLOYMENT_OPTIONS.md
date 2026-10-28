# CI/CD and hosting choices for MiloBroker

The selected SPA architecture is **GitHub → CodePipeline → CodeBuild → private S3 bucket → CloudFront invalidation**. Production publishes only a tagged release. GitHub Actions remains the pull-request and post-merge CI check; AWS CodePipeline is the release deployment pipeline. The end-to-end setup is in the [S3 and CloudFront deployment guide](AWS_STATIC_DEPLOYMENT.md).

## Repository facts and assumptions

1. **Confirmed from this checkout:** MiloBroker is a React 18 + TypeScript SPA built with Vite. `npm run build` runs the TypeScript check and writes static output to `dist/`. There is no application router, API server, or database in this repository. The Dockerfile is not needed for the selected S3 hosting path.
2. **Confirmed from this checkout:** `npm ci` and `npm run build` are the appropriate locked install and production build commands. The CodeBuild image must support Node.js 22 or later, matching `package.json`.
3. **User-selected:** GitHub connection → CodePipeline → CodeBuild → S3 → CloudFront invalidation, in `ap-southeast-2`. The S3 bucket and pipeline are regional; CloudFront is global and ACM's viewer certificate must be requested in `us-east-1`.
4. **Not verified or created:** AWS project resources, GitHub connection, IAM roles, DNS records at BigRock, certificates, billing, and repository branch protection. The current `.github/workflows/deploy-ec2.yml` still describes an EC2/ECR/SSM release and does not implement this architecture. Do not create a release tag until that old path is disabled/replaced and the AWS CodePipeline has been configured and tested.

## Hosting choices

| Option | How the SPA is served | Operations and trade-off |
| --- | --- | --- |
| **S3 + CloudFront (selected)** | CodeBuild uploads Vite's `dist/` files to S3; CloudFront serves HTTPS and caches them. | No VM to patch. S3, requests, build minutes, pipeline executions, CloudFront usage, and artifacts can still cost money. |
| AWS Amplify Hosting | Connect GitHub and let Amplify build/host the static output. | Fewer manual pipeline steps; it manages delivery infrastructure. Review its current pricing and build behavior. |
| EC2 + Docker + NGINX | Run the site's Docker image on a VM. | Supports learning Docker/NGINX; requires VM maintenance and incurs compute/storage/network charges. |
| EKS + Helm | Run Pods on Kubernetes and package deployment with Helm. | Adds cluster, worker, networking, and operational costs; unnecessary for this static SPA. |

S3 website hosting by itself serves HTTP only. The selected secure setup uses a **private S3 REST origin with CloudFront Origin Access Control (OAC)**. Keep S3 Block Public Access enabled; do not use a public-read bucket policy. The bucket's static website endpoint is not used as the CloudFront origin. See [the deployment guide](AWS_STATIC_DEPLOYMENT.md).

## Release and CI/CD flow

1. Protect `main` in GitHub. Require pull requests and the `Validate MiloBroker SPA / Type-check and build` check; restrict direct pushes. `.github/workflows/ci.yml` runs for opened/updated/reopened PRs and again after changes reach `main`.
2. After merge, wait for the `main` CI check to pass. Create a unique annotated version tag from that clean, tested `main` commit, for example `v1.0.0`.
3. Configure CodePipeline's GitHub CodeConnections source trigger to react only to pushed tags matching `v*`. The pipeline runs CodeBuild on the tagged source; a failed install/check/build stops the run before S3 deployment.
4. CodeBuild runs `npm ci` and `npm run build`, publishing only `dist/` as a pipeline artifact. The S3 deploy stage extracts those files into the private website bucket.
5. A **separate post-deploy CodeBuild action** creates the CloudFront invalidation. Do not put invalidation in the build stage's `post_build`: that stage runs before the S3 deploy stage. Prefer invalidating after successful deployment; use content-hashed assets and sensible HTML cache settings.
6. Verify the release at `https://www.milobroker.com`, check mobile layout and assets, and test that WhatsApp links open with the expected prefilled text. Do not send the message.

Example release commands in PowerShell:

```powershell
git switch main
git pull --ff-only
git status --short
git tag -a v1.0.0 -m "MiloBroker public site 1.0.0"
git push origin v1.0.0
```

Confirm that `main` CI passed and the working tree is clean before tagging. Never move or reuse a published tag; use a new patch version for a fix. CodePipeline supports Git tag triggers through a GitHub CodeConnections source action. The CodeBuild stage validates/builds the tag, while the release procedure ensures tags are cut only from green `main` commits. See [CodePipeline Git tag triggers](https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-github-tags.html).

## Cost guidance

Do not assume the architecture is free or promise a `$0–$1` total. AWS billing depends on the AWS project/account plan, Region, transfer volume, cached/origin requests, builds, pipeline type, logs, artifact retention, invalidations, and current allowances.

- **S3:** storage, requests, and internet data transfer may apply. CloudFront as an AWS origin avoids S3-to-CloudFront origin transfer charges, but does not remove S3 request/storage charges.
- **CloudFront:** AWS's pay-as-you-go pricing page currently lists monthly free usage allowances of 1 TB data transfer out and 10 million HTTP/HTTPS requests; invalidation paths are separately metered after the included monthly amount. Confirm eligibility and the pricing model shown for this AWS project before relying on those allowances.
- **CodeBuild:** current AWS pricing lists 100 free build minutes monthly for eligible on-demand small compute types, with charges for usage beyond allowances and possible artifact/log/service charges.
- **CodePipeline:** V1 and V2 have different pricing. V1 is charged per active pipeline after its first 30 days, with one active pipeline included in the listed free tier. V2 charges per action-execution minute and currently includes 100 monthly minutes. Check the pipeline type selected in the console.
- **Other items:** pipeline artifact storage, CloudWatch logs, data transfer, taxes, and any extra services may be billed. A free allowance is not a guaranteed monthly bill.

Use the [AWS Pricing Calculator](https://calculator.aws/) for `ap-southeast-2`, and review [S3](https://aws.amazon.com/s3/pricing/), [CloudFront](https://aws.amazon.com/cloudfront/pricing/), [CodeBuild](https://aws.amazon.com/codebuild/pricing/), and [CodePipeline](https://aws.amazon.com/codepipeline/pricing/) pricing. Set an AWS project spend limit/budget alert where available; alerts are not a substitute for reviewing actual usage.

## Official references

- [AWS CodePipeline GitHub connections and triggers](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html)
- [CodePipeline Git tag trigger tutorial](https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-github-tags.html)
- [AWS CodeBuild buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [S3 website hosting and HTTPS limitation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Origin Access Control for S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [CloudFront custom error responses](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/creating-custom-error-pages.html)
- [ACM public certificates](https://docs.aws.amazon.com/acm/latest/userguide/acm-public-certificates.html)
- [AWS Pricing Calculator](https://calculator.aws/)
