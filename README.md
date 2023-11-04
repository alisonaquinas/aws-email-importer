# AWS Email Importer

One of the most annoiying things aobut setting up a new domain
is setting up email. Services exist like google's G-Guite and
even Amazon Web services offers [WorkMail](https://aws.amazon.com/workmail/). all of these en up with a lot of mimitatiosns and it always feels like you are on the cusp of needing to pay more money than you want, just for an email service.

AWS Email Importer is a simple scrip that allows your emails to be direectly recived by your gmail inbox, and with the right configuration you can even send from your custom domain, right from gmail. Morover at standard email loads, this service can tun for pennies to a couple of dollars a month.

## AWS services you'll need

### AWS Simple Email Service (SES)

[AWS Simple Email Service](https://aws.amazon.com/ses/) is a simple mail interface offerd by Amazon. when configured with your DNS provider, it can be registred as both a valid, DKIM verified source of emails from your domain and a receiving mail server.

SES is not a magic bullet, howerver. It does not keep emails around for any longer than it needs to. It is an interdace, not a true mail server.

### AWS Amazon Simple Notification Service (SNS)

[Amazon Simple Notification Service](https://aws.amazon.com/sns/) is a menanisim that allows for evnets from various AWS sercices to be triggers for other services. This is similar to a message Queue, but it is greatly simplified and requres much less configuration to set up.

### AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) is a serverless comuting interface that allows for this script to be run on demand. onc configured, Amazon SES will trigger and Amazon SNS event that calls the main event handler for this script.

### AWS Secrets Manager

[AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) is a method of keeping your login credentials out of your scripts, accessable on demand by a simple, secure, REST interface. This will be used to store your IMAP login credentails for gmail.

### Amazon Route 53 (optional)

[Route 53](https://aws.amazon.com/route53/) is Amazon's distribured DNS service. It ahas integrations with other products in amazon (inluding SES), and supportes [DNSsec](https://www.icann.org/resources/pages/dnssec-what-is-it-why-important-2019-03-05-en) this adds a layer of security to your domain, ensureing that noone can hijack your domain with invalid dns records.

## Setup

I'll be honest, there are a lot of moving parts here. It's best to go into this with som knowlege of how [AWS IAM](https://aws.amazon.com/iam/) works and how to set up acces control between servers. However, if you have the time, this can be a great way to learn some AWS fundamentals if you're new to the scene.

### 1. (optional) Set up Route 53

![Amazon Rout 53 Console](documentation\Rout53.png)

Most/All domain anme registrars allow for you to specify your nameserver(s). Once you'd logged into your AWS account, go to the Route 53 console. Select "Hosted Zones" on your left, and then "Create Hosted Zone" on your right.

![Creation Screen](documentation\NewHostedZone.png)

Type in your domain and speciy "public hosted zone."

Once created, your new zone will appear in the list of hosted zones.

Note taht AWS will not automatically propigate your current DNS entries. If you already have some set up with your regitrar you should add those to your route 53 zone, befor proceeding further.
Once you have your existing entries coppied over, you can now select your domain and expand the "Hosted Zone Details" area.

!["Hosted Zone Details](documentation\HostedZone.png)

Here you will see a list of four dns nameservers that you will need to point your DNS Regisrar to for this domain. Once you specify your name servers to the registrar, Route 53 will be the source for all DNS lookups of your domain.

### 2. Set up SES

Go to the SES consol page ang click "Get Started"

![Ses Main Page](documentation\SesMain.png)

In the left sidbear, click "Verified Identies." From this panel, you are able to veridy the identiy of any email or domain that you would like to be able to use SES to send mail with. in this cse, we'll want to set up a domain.

![New Identity Screen](image.png)

Eneter your domain Name, and follow the steps to add CNAME records to your domain for verificatio. Note that it's good practice to also add the legacy text recordes for maximial compatiblity.

![Legacy records](documentation\TXTRecord.png)

your DNS may already have a text record for its root, note that multiple recordes may be added to a domainName like this:

``` TXT record
"record1"
"record2"
...
```

It will take a while for the domain to be validated, once you add the records, Just be patent. In the mean time, we'll set up out script.

### 3. Set up SNS

Go to the SNS console in AWS enter a name like "new-ses-email" and select "Create Topic"

![Create Topic](documentation\CreateTopic.png)

configure the topic as you like and enabel JSON based permissions:

![Alt text](image.png)

You will want to enable SES to have publishing rights to the SNS topic by adding an entry like this:

```JSON
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "[nameofthispolicy]",
      "Effect": "Allow",
      "Principal": {
        "Service": "ses.amazonaws.com"
      },
      "Action": "SNS:Publish",
      "Condition": {
        "StringEquals": {
          "AWS:SourceAccount": "[The Account ID of the user managing SES]"
        },
        "StringLike": {
          "AWS:SourceArn": "arn:aws:ses:*"
        }
      }
    }
  ]
}
```

### 4. Set up Lambda

WIP

### 5 Set up gmail credentials

WIP

### 5. Back to ses

WIP

### 6. Set up MX records

WIP

### 7. Set up SPF and DMARC

WIP

### 8. Set up aliases in GMAIL

WIP