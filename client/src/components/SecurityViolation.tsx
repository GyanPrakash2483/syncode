export default function SecurityViolation() {
  return (
    <div className="bg-[#1e1e1e] h-screen flex flex-col items-center justify-center gap-12">
      <div className="text-8xl">
        Security Policy Violation
      </div>
      <div className="text-4xl">
        License Verification Failed
      </div>
      <div className="text-xl">
        This behaviour might be intentional, contact developer of the application for further clarification.
      </div>
    </div>
  )
}