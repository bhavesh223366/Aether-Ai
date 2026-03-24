import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center" style={{ minHeight: "100vh", position: "relative" }}>
      <div className="background-effects">
        <div className="glow-circle top-right"></div>
        <div className="glow-circle bottom-left"></div>
      </div>
      <SignUp />
    </div>
  );
}
