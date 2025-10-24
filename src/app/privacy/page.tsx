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

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 23, 2025";

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="md">
          <Title order={1}>Privacy Policy</Title>
          <Text c="dimmed">Last updated: {lastUpdated}</Text>
        </Stack>

        <Paper p="xl" radius="md" withBorder>
          <Stack gap="xl">
            {/* Introduction */}
            <Stack gap="md">
              <Text>
                Welcome to MagicSAK (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). We are committed to protecting your privacy and
                ensuring the security of your personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you use our web application.
              </Text>
              <Text>
                By using MagicSAK, you agree to the collection and use of
                information in accordance with this policy. If you do not agree
                with our policies and practices, please do not use our service.
              </Text>
            </Stack>

            <Divider />

            {/* Information We Collect */}
            <Stack gap="md">
              <Title order={2} size="h3">
                1. Information We Collect
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  1.1 Information You Provide
                </Title>
                <Text>When you create an account, we collect:</Text>
                <List>
                  <List.Item>
                    Email address (required for account creation and
                    authentication)
                  </List.Item>
                  <List.Item>
                    Password (securely hashed and encrypted)
                  </List.Item>
                  <List.Item>
                    Deck names and card selections you create
                  </List.Item>
                  <List.Item>
                    Profile information you choose to provide
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  1.2 Automatically Collected Information
                </Title>
                <Text>
                  When you use our service, we may automatically collect:
                </Text>
                <List>
                  <List.Item>
                    Device information (browser type, operating system)
                  </List.Item>
                  <List.Item>
                    Usage data (pages visited, features used, time spent)
                  </List.Item>
                  <List.Item>
                    IP address and general location information
                  </List.Item>
                  <List.Item>
                    Cookies and similar tracking technologies
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  1.3 Third-Party Services
                </Title>
                <Text>
                  We use{" "}
                  <Anchor
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Supabase
                  </Anchor>{" "}
                  for authentication and database services. Supabase may collect
                  additional information as described in their{" "}
                  <Anchor
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    privacy policy
                  </Anchor>
                  .
                </Text>
                <Text mt="sm">
                  This site is protected by reCAPTCHA and the Google{" "}
                  <Anchor
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Anchor>{" "}
                  and{" "}
                  <Anchor
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </Anchor>{" "}
                  apply.
                </Text>
              </Stack>
            </Stack>

            <Divider />

            {/* How We Use Your Information */}
            <Stack gap="md">
              <Title order={2} size="h3">
                2. How We Use Your Information
              </Title>
              <Text>We use the information we collect to:</Text>
              <List>
                <List.Item>
                  Provide, maintain, and improve our services
                </List.Item>
                <List.Item>Create and manage your account</List.Item>
                <List.Item>
                  Enable you to create, save, and play with decks
                </List.Item>
                <List.Item>
                  Allow you to share decks with the community if you choose
                </List.Item>
                <List.Item>
                  Send you important updates about our service
                </List.Item>
                <List.Item>Respond to your comments and questions</List.Item>
                <List.Item>
                  Detect and prevent fraud, abuse, and security issues
                </List.Item>
                <List.Item>
                  Analyze usage patterns to improve user experience
                </List.Item>
                <List.Item>Comply with legal obligations</List.Item>
              </List>
            </Stack>

            <Divider />

            {/* Information Sharing */}
            <Stack gap="md">
              <Title order={2} size="h3">
                3. Information Sharing and Disclosure
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.1 Public Information
                </Title>
                <Text>
                  When you choose to make a deck public, the deck name and card
                  list become visible to other users. Your email address and
                  other personal information remain private.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.2 Service Providers
                </Title>
                <Text>
                  We may share your information with third-party service
                  providers who assist us in:
                </Text>
                <List>
                  <List.Item>
                    Hosting and maintaining our infrastructure (Vercel,
                    Supabase)
                  </List.Item>
                  <List.Item>Analytics and performance monitoring</List.Item>
                  <List.Item>
                    Security and fraud prevention (reCAPTCHA)
                  </List.Item>
                </List>
                <Text mt="sm">
                  These providers are contractually obligated to protect your
                  information and use it only for the purposes we specify.
                </Text>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.3 Legal Requirements
                </Title>
                <Text>
                  We may disclose your information if required by law, court
                  order, or government regulation, or if we believe such action
                  is necessary to:
                </Text>
                <List>
                  <List.Item>Comply with legal obligations</List.Item>
                  <List.Item>Protect our rights, property, or safety</List.Item>
                  <List.Item>Prevent fraud or abuse</List.Item>
                  <List.Item>
                    Protect the rights and safety of our users
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  3.4 What We Don&apos;t Do
                </Title>
                <Text fw={600}>We do not:</Text>
                <List>
                  <List.Item>
                    Sell your personal information to third parties
                  </List.Item>
                  <List.Item>
                    Share your email address with other users
                  </List.Item>
                  <List.Item>Send unsolicited marketing emails</List.Item>
                  <List.Item>
                    Use your data for purposes beyond those stated in this
                    policy
                  </List.Item>
                </List>
              </Stack>
            </Stack>

            <Divider />

            {/* Data Security */}
            <Stack gap="md">
              <Title order={2} size="h3">
                4. Data Security
              </Title>
              <Text>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. These measures
                include:
              </Text>
              <List>
                <List.Item>Encrypted data transmission (HTTPS/SSL)</List.Item>
                <List.Item>Secure password hashing</List.Item>
                <List.Item>
                  Row-level security policies in our database
                </List.Item>
                <List.Item>Regular security audits and updates</List.Item>
                <List.Item>
                  Access controls and authentication requirements
                </List.Item>
              </List>
              <Text mt="sm">
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to protect
                your information, we cannot guarantee absolute security.
              </Text>
            </Stack>

            <Divider />

            {/* Your Rights */}
            <Stack gap="md">
              <Title order={2} size="h3">
                5. Your Rights and Choices
              </Title>
              <Text>You have the right to:</Text>
              <List>
                <List.Item>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </List.Item>
                <List.Item>
                  <strong>Correction:</strong> Request corrections to inaccurate
                  or incomplete information
                </List.Item>
                <List.Item>
                  <strong>Deletion:</strong> Request deletion of your account
                  and associated data
                </List.Item>
                <List.Item>
                  <strong>Data Portability:</strong> Request your data in a
                  portable format
                </List.Item>
                <List.Item>
                  <strong>Opt-out:</strong> Opt out of certain data collection
                  and processing
                </List.Item>
                <List.Item>
                  <strong>Privacy Settings:</strong> Control whether your decks
                  are public or private
                </List.Item>
              </List>
              <Text mt="sm">
                To exercise these rights, please contact us using the
                information provided at the end of this policy. We will respond
                to your request within 30 days.
              </Text>
            </Stack>

            <Divider />

            {/* Cookies */}
            <Stack gap="md">
              <Title order={2} size="h3">
                6. Cookies and Tracking Technologies
              </Title>
              <Text>We use cookies and similar tracking technologies to:</Text>
              <List>
                <List.Item>Keep you signed in to your account</List.Item>
                <List.Item>
                  Remember your preferences (theme, language)
                </List.Item>
                <List.Item>Analyze site usage and performance</List.Item>
                <List.Item>Provide security features</List.Item>
              </List>
              <Text mt="sm">
                You can control cookies through your browser settings. However,
                disabling cookies may affect your ability to use certain
                features of our service.
              </Text>
            </Stack>

            <Divider />

            {/* Data Retention */}
            <Stack gap="md">
              <Title order={2} size="h3">
                7. Data Retention
              </Title>
              <Text>
                We retain your personal information for as long as your account
                is active or as needed to provide you services. If you delete
                your account, we will delete or anonymize your personal
                information within 30 days, except where we are required to
                retain it for legal, regulatory, or security purposes.
              </Text>
              <Text mt="sm">
                Publicly shared decks may remain visible even after account
                deletion, but will no longer be associated with your account.
              </Text>
            </Stack>

            <Divider />

            {/* Children's Privacy */}
            <Stack gap="md">
              <Title order={2} size="h3">
                8. Children&apos;s Privacy
              </Title>
              <Text>
                Our service is not intended for children under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us,
                and we will delete such information from our systems.
              </Text>
            </Stack>

            <Divider />

            {/* International Users */}
            <Stack gap="md">
              <Title order={2} size="h3">
                9. International Users
              </Title>
              <Text>
                MagicSAK is operated in the United States. If you are accessing
                our service from outside the United States, please be aware that
                your information may be transferred to, stored, and processed in
                the United States where our servers are located. By using our
                service, you consent to this transfer.
              </Text>
            </Stack>

            <Divider />

            {/* Third-Party Links */}
            <Stack gap="md">
              <Title order={2} size="h3">
                10. Third-Party Links
              </Title>
              <Text>
                Our service may contain links to third-party websites or
                services (such as card image sources). We are not responsible
                for the privacy practices of these third parties. We encourage
                you to read their privacy policies before providing any
                information to them.
              </Text>
            </Stack>

            <Divider />

            {/* Changes to Privacy Policy */}
            <Stack gap="md">
              <Title order={2} size="h3">
                11. Changes to This Privacy Policy
              </Title>
              <Text>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for legal, operational, or
                regulatory reasons. We will notify you of any material changes
                by:
              </Text>
              <List>
                <List.Item>
                  Posting the new Privacy Policy on this page
                </List.Item>
                <List.Item>
                  Updating the &quot;Last updated&quot; date at the top
                </List.Item>
                <List.Item>
                  Sending you an email notification (for significant changes)
                </List.Item>
              </List>
              <Text mt="sm">
                Your continued use of our service after changes become effective
                constitutes acceptance of the revised policy.
              </Text>
            </Stack>

            <Divider />

            {/* Contact Information */}
            <Stack gap="md">
              <Title order={2} size="h3">
                12. Contact Us
              </Title>
              <Text>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </Text>
              <Text mt="sm">
                <strong>Email:</strong> contact@magicsak.com
              </Text>
              <Text>
                <strong>Response Time:</strong> We will respond to your inquiry
                within 5 business days.
              </Text>
            </Stack>

            <Divider />

            {/* GDPR/CCPA Notice */}
            <Stack gap="md">
              <Title order={2} size="h3">
                13. Additional Rights for Certain Jurisdictions
              </Title>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  For California Residents (CCPA)
                </Title>
                <Text>
                  If you are a California resident, you have additional rights
                  under the California Consumer Privacy Act (CCPA), including:
                </Text>
                <List>
                  <List.Item>
                    Right to know what personal information we collect
                  </List.Item>
                  <List.Item>
                    Right to delete your personal information
                  </List.Item>
                  <List.Item>
                    Right to opt-out of sale (we do not sell your information)
                  </List.Item>
                  <List.Item>
                    Right to non-discrimination for exercising your rights
                  </List.Item>
                </List>
              </Stack>

              <Stack gap="sm">
                <Title order={3} size="h4">
                  For EU/EEA Residents (GDPR)
                </Title>
                <Text>
                  If you are in the European Union or European Economic Area,
                  you have rights under the General Data Protection Regulation
                  (GDPR), including:
                </Text>
                <List>
                  <List.Item>
                    Right to access and receive a copy of your data
                  </List.Item>
                  <List.Item>
                    Right to rectification of inaccurate data
                  </List.Item>
                  <List.Item>
                    Right to erasure (&quot;right to be forgotten&quot;)
                  </List.Item>
                  <List.Item>Right to restrict processing</List.Item>
                  <List.Item>Right to data portability</List.Item>
                  <List.Item>Right to object to processing</List.Item>
                  <List.Item>Right to withdraw consent</List.Item>
                  <List.Item>
                    Right to lodge a complaint with a supervisory authority
                  </List.Item>
                </List>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Footer Note */}
        <Text size="sm" c="dimmed" ta="center">
          This Privacy Policy is effective as of {lastUpdated}. Please review it
          periodically for updates.
        </Text>
      </Stack>
    </Container>
  );
}
