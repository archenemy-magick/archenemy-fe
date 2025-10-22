"use client";

import {
  Container,
  Paper,
  Title,
  Text,
  Avatar,
  Group,
  Button,
  Stack,
  TextInput,
  PasswordInput,
  FileButton,
  Divider,
  Badge,
  Modal,
  Box,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUpload,
  IconTrash,
  IconMail,
  IconLock,
  IconUserCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  getCurrentUserProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  updateEmail,
  updatePassword,
  deleteAccount,
} from "~/lib/api/profile";
import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { updateUserAvatar } from "~/store/reducers";

type Profile = {
  id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
};

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modal states
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUserProfile();
      setProfile(data);
      setUsername(data.username);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setNewEmail(data.email);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load profile",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        username,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
      });

      await loadProfile();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to update profile",
        color: "red",
      });
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifications.show({
        title: "Error",
        message: "Please upload an image file",
        color: "red",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notifications.show({
        title: "Error",
        message: "Image must be less than 2MB",
        color: "red",
      });
      return;
    }

    try {
      setUploading(true);
      await uploadAvatar(file);

      // Reload profile to get new avatar URL
      const updatedProfile = await getCurrentUserProfile();
      setProfile(updatedProfile);

      // Update Redux store
      dispatch(updateUserAvatar(updatedProfile.avatar_url));

      notifications.show({
        title: "Success",
        message: "Avatar uploaded successfully",
        color: "green",
      });
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to upload avatar",
        color: "red",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();

      // Update Redux store
      dispatch(updateUserAvatar(null));

      notifications.show({
        title: "Success",
        message: "Avatar deleted successfully",
        color: "green",
      });
      await loadProfile();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to delete avatar",
        color: "red",
      });
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      notifications.show({
        title: "Info",
        message: "Please enter a new email address",
        color: "blue",
      });
      return;
    }

    try {
      await updateEmail(newEmail);
      notifications.show({
        title: "Success",
        message: "Email updated. Please check your inbox to confirm.",
        color: "green",
      });
      await loadProfile();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to update email",
        color: "red",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      notifications.show({
        title: "Error",
        message: "Please enter a new password",
        color: "red",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: "Error",
        message: "Passwords do not match",
        color: "red",
      });
      return;
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "Password must be at least 6 characters",
        color: "red",
      });
      return;
    }

    try {
      await updatePassword(newPassword);
      notifications.show({
        title: "Success",
        message: "Password updated successfully",
        color: "green",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to update password",
        color: "red",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      notifications.show({
        title: "Account Deleted",
        message: "Your account has been marked for deletion",
        color: "orange",
      });
      router.push("/");
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: (error as Error).message || "Failed to delete account",
        color: "red",
      });
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Text>Loading profile...</Text>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container size="md" py="xl">
        <Text>Profile not found</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Profile Settings</Title>
          <Text c="dimmed" size="sm">
            Manage your account settings and preferences
          </Text>
        </div>

        {/* Avatar Section */}
        <Paper p="lg" withBorder>
          <Title order={3} mb="md">
            <Group gap="xs">
              <IconUserCircle size={24} />
              Avatar
            </Group>
          </Title>

          <Group>
            <Avatar
              src={profile.avatar_url}
              size={120}
              radius="md"
              alt={profile.username}
            />
            <Stack gap="xs">
              <FileButton
                onChange={handleAvatarUpload}
                accept="image/png,image/jpeg,image/jpg,image/gif"
              >
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={16} />}
                    loading={uploading}
                  >
                    Upload Avatar
                  </Button>
                )}
              </FileButton>
              {profile.avatar_url && (
                <Button
                  variant="subtle"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDeleteAvatar}
                >
                  Remove Avatar
                </Button>
              )}
              <Text size="xs" c="dimmed">
                Max size: 2MB. Supported: PNG, JPG, GIF
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Profile Information */}
        <Paper p="lg" withBorder>
          <Title order={3} mb="md">
            Profile Information
          </Title>

          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
              />
              <TextInput
                label="Last Name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
              />
            </Group>

            <Group>
              <Badge variant="light">{profile.status}</Badge>
              <Text size="xs" c="dimmed">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </Group>

            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </Stack>
        </Paper>

        {/* Email Settings */}
        <Paper p="lg" withBorder>
          <Title order={3} mb="md">
            <Group gap="xs">
              <IconMail size={24} />
              Email
            </Group>
          </Title>

          <Stack gap="md">
            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.currentTarget.value)}
              type="email"
            />
            <Text size="xs" c="dimmed">
              Changing your email will require verification
            </Text>
            <Button
              onClick={handleUpdateEmail}
              disabled={newEmail === profile.email}
            >
              Update Email
            </Button>
          </Stack>
        </Paper>

        {/* Password Settings */}
        <Paper p="lg" withBorder>
          <Title order={3} mb="md">
            <Group gap="xs">
              <IconLock size={24} />
              Password
            </Group>
          </Title>

          <Stack gap="md">
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            />
            <Button onClick={handleUpdatePassword}>Change Password</Button>
          </Stack>
        </Paper>

        {/* Danger Zone */}
        <Paper
          p="lg"
          withBorder
          style={{ borderColor: "var(--mantine-color-red-6)" }}
        >
          <Title order={3} mb="md" c="red">
            <Group gap="xs">
              <IconAlertTriangle size={24} />
              Danger Zone
            </Group>
          </Title>

          <Stack gap="md">
            <Text size="sm">
              Once you delete your account, there is no going back. Please be
              certain.
            </Text>
            <Button color="red" onClick={openDeleteModal}>
              Delete Account
            </Button>
          </Stack>
        </Paper>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Account"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>
          <Text size="sm" c="dimmed">
            All your decks and data will be permanently deleted.
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => {
                handleDeleteAccount();
                closeDeleteModal();
              }}
            >
              Yes, Delete My Account
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
