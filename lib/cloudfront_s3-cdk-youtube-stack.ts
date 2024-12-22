import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {S3BucketOrigin} from "aws-cdk-lib/aws-cloudfront-origins"
export class CloudfrontS3CdkYoutubeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext('stage') || 'dev';

    // creating s3 bucket
    const bucket = new cdk.aws_s3.Bucket(this, `cloudFrontS3-${stage}`, {
      bucketName: `cloudfront-s3-${stage}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      accessControl: cdk.aws_s3.BucketAccessControl.LOG_DELIVERY_WRITE
    })

    // create cloudfront distribution
    const cloudfront = new cdk.aws_cloudfront.Distribution(this, `cloudfront-${stage}`, {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        originRequestPolicy: cdk.aws_cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: cdk.aws_cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
        cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      priceClass: cdk.aws_cloudfront.PriceClass.PRICE_CLASS_ALL,
      enableLogging: true,
      logBucket: bucket,
      logFilePrefix: 'cloudfront-logs',
      geoRestriction: cdk.aws_cloudfront.GeoRestriction.allowlist("IN"),
    })

    cloudfront.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // create policy document
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          "s3:GetObject",
        ],
        resources: [
          bucket.bucketArn,
          `${bucket.bucketArn}/*`
        ],
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [
          new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com")
        ]
      })
    )

    const output = new cdk.CfnOutput(this, 'CloudFront URL', {
      value: cloudfront.distributionDomainName
    });

    output.node.addDependency(cloudfront);

  }
}
