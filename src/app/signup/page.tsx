import { SignUpForm } from "~/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SignUpForm />
    </div>
  );
}
