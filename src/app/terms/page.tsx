"use client";

import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Anchor,
  List,
  Divider,
} from "@mantine/core";

export default function TermsOfServicePage() {
  const lastUpdated = "October 23, 2025";

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="md">
          <Title order={1}>Terms of Service</Title>
          <Text c="dimmed">Last updated: {lastUpdated}</Text>
        </Stack>

        <Paper p="xl" radius="md" withBorder>
          <Stack gap="xl">
            {/* Introduction */}
            <Stack gap="md">
              <Text>
                Welcome to MagicSAK! These Terms of Service (&quot;Terms&quot;)
                govern your access to and use of MagicSAK&apos;s website,
                services, and applications (collectively, the
                &quot;Service&quot;). Please read these Terms carefully before
                using our Service.
              </Text>
              <Text>
                By accessing or using MagicSAK, you agree to be bound by these
                Terms and our <Anchor href="/privacy">Privacy Policy</Anchor>.
                If you do not agree to these Terms, you may not access or use
                our Service.
              </Text>
            </Stack>

            <Divider />

            {/* Acceptance of Terms */}
            <Stack gap="md">
              <Title order={2} size="h3">
                1. Acceptance of Terms
              </Title>
              <Text>
                By creating an account or using any part of our Service, you
                acknowledge that you have read, understood, and agree to be
                bound by these Terms. These Terms apply to all visitors, users,
                and others who access or use the Service.
              </Text>
              <Text mt="sm">
                We may update these Terms from time to time. When we do, we will
                revise the &quot;Last updated&quot; date at the top of this
                page. Your continued use of the Service after changes become
                effective constitutes acceptance of the revised Terms.
              </Text>
            </Stack>

            <Divider />

            {/* Eligibility */}
            <Stack gap="md">
              <Title order={2} size="h3">
                2. Eligibility
              </Title>
              <Text>To use MagicSAK, you must:</Text>
              <List>
                <List.Item>Be at least 13 years of age</List.Item>
                <List.Item>
                  Have the legal capacity to enter into these Terms
                </List.Item>
                <List.Item>
                  Not be prohibited from using the Service under applicable law
                </List.Item>
                <List.Item>
                  Provide accurate and complete information during registration
                </List.Item>
              </List>
              <Text mt="sm">
                If you are under 18, you represent that you have your parent or
                guardian&apos;s permission to use the Service. Parents and
                guardians are responsible for the actions of their minors using
                the Service.
              </Text>
            </Stack>

            <Divider />

            {/* Account Registration */}
            <Stack gap="md">
              <Title order={2} size="h3">
                3. Account Registration and Security
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.1 Account Creation
                </Title>
                <Text>
                  To access certain features of MagicSAK, you must create an
                  account. When you create an account, you agree to:
                </Text>
                <List>
                  <List.Item>
                    Provide accurate, current, and complete information
                  </List.Item>
                  <List.Item>
                    Maintain and update your information to keep it accurate
                  </List.Item>
                  <List.Item>Choose a secure password</List.Item>
                  <List.Item>
                    Notify us immediately of any unauthorized access
                  </List.Item>
                  <List.Item>
                    Accept responsibility for all activities under your account
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.2 Account Security
                </Title>
                <Text>
                  You are responsible for maintaining the confidentiality of
                  your account credentials. You agree to:
                </Text>
                <List>
                  <List.Item>Not share your password with others</List.Item>
                  <List.Item>
                    Log out from your account at the end of each session
                  </List.Item>
                  <List.Item>
                    Immediately notify us of any suspected security breach
                  </List.Item>
                </List>
                <Text mt="sm">
                  We are not liable for any loss or damage arising from your
                  failure to protect your account credentials.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.3 Account Termination
                </Title>
                <Text>
                  We reserve the right to suspend or terminate your account at
                  any time for any reason, including but not limited to:
                </Text>
                <List>
                  <List.Item>Violation of these Terms</List.Item>
                  <List.Item>
                    Fraudulent, abusive, or illegal activity
                  </List.Item>
                  <List.Item>Extended periods of inactivity</List.Item>
                  <List.Item>At your request</List.Item>
                </List>
              </Stack>
            </Stack>

            <Divider />

            {/* Use of Service */}
            <Stack gap="md">
              <Title order={2} size="h3">
                4. Use of Service
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  4.1 License
                </Title>
                <Text>
                  Subject to these Terms, we grant you a limited, non-exclusive,
                  non-transferable, revocable license to access and use MagicSAK
                  for your personal, non-commercial use.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  4.2 Acceptable Use
                </Title>
                <Text>
                  You agree to use MagicSAK only for lawful purposes. You agree
                  NOT to:
                </Text>
                <List>
                  <List.Item>
                    Violate any applicable laws or regulations
                  </List.Item>
                  <List.Item>
                    Infringe on the intellectual property rights of others
                  </List.Item>
                  <List.Item>
                    Transmit any malicious code, viruses, or harmful content
                  </List.Item>
                  <List.Item>
                    Attempt to gain unauthorized access to our systems
                  </List.Item>
                  <List.Item>
                    Interfere with or disrupt the Service or servers
                  </List.Item>
                  <List.Item>
                    Use automated systems (bots, scrapers) without permission
                  </List.Item>
                  <List.Item>Impersonate any person or entity</List.Item>
                  <List.Item>Harass, abuse, or harm other users</List.Item>
                  <List.Item>
                    Collect or harvest user information without consent
                  </List.Item>
                  <List.Item>
                    Use the Service for commercial purposes without
                    authorization
                  </List.Item>
                  <List.Item>
                    Reverse engineer or attempt to extract source code
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  4.3 Content Standards
                </Title>
                <Text>
                  When creating public decks or interacting with the community,
                  you agree to:
                </Text>
                <List>
                  <List.Item>
                    Not post offensive, inappropriate, or illegal content
                  </List.Item>
                  <List.Item>
                    Respect other users and their contributions
                  </List.Item>
                  <List.Item>
                    Not use deck names that are profane, hateful, or
                    discriminatory
                  </List.Item>
                  <List.Item>Not spam or post repetitive content</List.Item>
                </List>
              </Stack>
            </Stack>

            <Divider />

            {/* User Content */}
            <Stack gap="md">
              <Title order={2} size="h3">
                5. User Content and Intellectual Property
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  5.1 Your Content
                </Title>
                <Text>
                  You retain ownership of the content you create on MagicSAK,
                  including deck names and card selections (&quot;User
                  Content&quot;). By making your decks public, you grant us a
                  worldwide, non-exclusive, royalty-free license to:
                </Text>
                <List>
                  <List.Item>
                    Display your public decks to other users
                  </List.Item>
                  <List.Item>
                    Store and process your content to provide the Service
                  </List.Item>
                  <List.Item>
                    Create aggregated, anonymized statistics
                  </List.Item>
                </List>
                <Text mt="sm">
                  You can make your decks private or delete them at any time,
                  which will revoke this license.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  5.2 Our Intellectual Property
                </Title>
                <Text>
                  MagicSAK and its original content (excluding User Content and
                  third-party card data) are the intellectual property of
                  MagicSAK and are protected by copyright, trademark, and other
                  laws. You may not:
                </Text>
                <List>
                  <List.Item>
                    Copy, modify, or distribute our content without permission
                  </List.Item>
                  <List.Item>
                    Use our trademarks or branding without authorization
                  </List.Item>
                  <List.Item>Remove or alter any copyright notices</List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  5.3 Magic: The Gathering Content
                </Title>
                <Text>
                  Magic: The Gathering, including all card names, artwork, and
                  game mechanics, is the intellectual property of Wizards of the
                  Coast LLC, a subsidiary of Hasbro, Inc. MagicSAK is not
                  affiliated with, endorsed, sponsored, or approved by Wizards
                  of the Coast or Hasbro.
                </Text>
                <Text mt="sm">
                  Card images and data are used under fair use for informational
                  and reference purposes. All rights to Magic: The Gathering
                  content belong to their respective owners.
                </Text>
              </Stack>
            </Stack>

            <Divider />

            {/* Disclaimer of Warranties */}
            <Stack gap="md">
              <Title order={2} size="h3">
                6. Disclaimer of Warranties
              </Title>
              <Text fw={600}>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                OR IMPLIED.
              </Text>
              <Text mt="sm">
                To the fullest extent permitted by law, we disclaim all
                warranties, including:
              </Text>
              <List>
                <List.Item>
                  Warranties of merchantability and fitness for a particular
                  purpose
                </List.Item>
                <List.Item>
                  That the Service will be uninterrupted, secure, or error-free
                </List.Item>
                <List.Item>That defects will be corrected</List.Item>
                <List.Item>
                  That the Service is free of viruses or harmful components
                </List.Item>
                <List.Item>
                  The accuracy, reliability, or completeness of any content
                </List.Item>
              </List>
              <Text mt="sm">
                You use the Service at your own risk. We do not guarantee that
                the Service will meet your requirements or expectations.
              </Text>
            </Stack>

            <Divider />

            {/* Limitation of Liability */}
            <Stack gap="md">
              <Title order={2} size="h3">
                7. Limitation of Liability
              </Title>
              <Text fw={600}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAGICSAK SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
                INCURRED DIRECTLY OR INDIRECTLY.
              </Text>
              <Text mt="sm">This includes damages for:</Text>
              <List>
                <List.Item>Loss of data or content</List.Item>
                <List.Item>Service interruptions or errors</List.Item>
                <List.Item>Unauthorized access to your account</List.Item>
                <List.Item>Actions of third parties</List.Item>
                <List.Item>Any other matter relating to the Service</List.Item>
              </List>
              <Text mt="sm">
                In no event shall our total liability exceed $100 USD or the
                amount you paid us (if any) in the 12 months prior to the event
                giving rise to liability.
              </Text>
            </Stack>

            <Divider />

            {/* Indemnification */}
            <Stack gap="md">
              <Title order={2} size="h3">
                8. Indemnification
              </Title>
              <Text>
                You agree to indemnify, defend, and hold harmless MagicSAK, its
                officers, directors, employees, and agents from any claims,
                liabilities, damages, losses, costs, or expenses (including
                reasonable attorneys&apos; fees) arising from:
              </Text>
              <List>
                <List.Item>Your use or misuse of the Service</List.Item>
                <List.Item>Your violation of these Terms</List.Item>
                <List.Item>
                  Your violation of any rights of another party
                </List.Item>
                <List.Item>Your User Content</List.Item>
                <List.Item>Any dispute between you and another user</List.Item>
              </List>
            </Stack>

            <Divider />

            {/* Third-Party Services */}
            <Stack gap="md">
              <Title order={2} size="h3">
                9. Third-Party Services
              </Title>
              <Text>
                MagicSAK may integrate with or link to third-party services,
                including:
              </Text>
              <List>
                <List.Item>Supabase (authentication and database)</List.Item>
                <List.Item>Google reCAPTCHA (security)</List.Item>
                <List.Item>Card image providers</List.Item>
                <List.Item>Analytics services</List.Item>
              </List>
              <Text mt="sm">
                Your use of third-party services is subject to their respective
                terms and privacy policies. We are not responsible for the
                practices or content of third-party services.
              </Text>
            </Stack>

            <Divider />

            {/* Modifications */}
            <Stack gap="md">
              <Title order={2} size="h3">
                10. Modifications to Service
              </Title>
              <Text>
                We reserve the right to modify, suspend, or discontinue any
                aspect of the Service at any time, with or without notice. We
                may also impose limits on certain features or restrict access to
                parts or all of the Service without liability.
              </Text>
              <Text mt="sm">
                We will make reasonable efforts to notify users of significant
                changes, but are not obligated to do so.
              </Text>
            </Stack>

            <Divider />

            {/* Governing Law */}
            <Stack gap="md">
              <Title order={2} size="h3">
                11. Governing Law and Dispute Resolution
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  11.1 Governing Law
                </Title>
                <Text>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the United States and the State of [Your
                  State], without regard to its conflict of law provisions.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  11.2 Dispute Resolution
                </Title>
                <Text>
                  Any dispute arising from these Terms or the Service shall be
                  resolved through:
                </Text>
                <List type="ordered">
                  <List.Item>
                    <strong>Informal Resolution:</strong> Contact us first to
                    resolve the dispute informally
                  </List.Item>
                  <List.Item>
                    <strong>Arbitration:</strong> If informal resolution fails,
                    disputes will be resolved through binding arbitration
                  </List.Item>
                </List>
                <Text mt="sm">
                  You agree to waive your right to participate in class actions
                  or class arbitrations.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  11.3 Exceptions
                </Title>
                <Text>
                  Either party may seek injunctive relief in court to prevent
                  actual or threatened infringement, misappropriation, or
                  violation of intellectual property rights.
                </Text>
              </Stack>
            </Stack>

            <Divider />

            {/* General Provisions */}
            <Stack gap="md">
              <Title order={2} size="h3">
                12. General Provisions
              </Title>

              <List spacing="sm">
                <List.Item>
                  <strong>Entire Agreement:</strong> These Terms, together with
                  our Privacy Policy, constitute the entire agreement between
                  you and MagicSAK.
                </List.Item>
                <List.Item>
                  <strong>Severability:</strong> If any provision is found
                  invalid, the remaining provisions remain in full effect.
                </List.Item>
                <List.Item>
                  <strong>No Waiver:</strong> Our failure to enforce any right
                  or provision does not constitute a waiver of that right.
                </List.Item>
                <List.Item>
                  <strong>Assignment:</strong> You may not assign or transfer
                  these Terms. We may assign our rights without restriction.
                </List.Item>
                <List.Item>
                  <strong>Force Majeure:</strong> We are not liable for delays
                  or failures caused by circumstances beyond our reasonable
                  control.
                </List.Item>
                <List.Item>
                  <strong>Survival:</strong> Provisions that should survive
                  termination (including liability limitations and intellectual
                  property terms) will survive.
                </List.Item>
              </List>
            </Stack>

            <Divider />

            {/* Contact Information */}
            <Stack gap="md">
              <Title order={2} size="h3">
                13. Contact Information
              </Title>
              <Text>
                If you have questions about these Terms, please contact us:
              </Text>
              <Text mt="sm">
                <strong>Email:</strong> contact@magicsak.com
              </Text>
              <Text>
                <strong>Response Time:</strong> We will respond to inquiries
                within 5 business days.
              </Text>
            </Stack>

            <Divider />

            {/* Acknowledgment */}
            <Stack gap="md">
              <Title order={2} size="h3">
                14. Acknowledgment
              </Title>
              <Text>
                BY USING MAGICSAK, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE
                TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY
                THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR
                USE THE SERVICE.
              </Text>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer Note */}
        <Text size="sm" c="dimmed" ta="center">
          These Terms of Service are effective as of {lastUpdated}. Please
          review them periodically for updates.
        </Text>
      </Stack>
    </Container>
  );
}
