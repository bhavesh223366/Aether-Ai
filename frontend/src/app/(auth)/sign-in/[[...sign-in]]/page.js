import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center" style={{ minHeight: "100vh", position: "relative" }}>
      <div className="background-effects">
        <div className="glow-circle top-right"></div>
        <div className="glow-circle bottom-left"></div>
      </div>
      <SignIn />
    </div>
  );
}
