import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-[#40e0d0] hover:bg-[#20f0e8] text-gray-900",
              card: "bg-white shadow-lg border border-gray-200",
              headerTitle: "text-gray-900",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "border-[#40e0d0] hover:bg-[#40e0d0]/10",
              formFieldInput: "border-gray-300 focus:border-[#00ffff] focus:ring-[#00ffff]",
              footerActionLink: "text-[#00ffff] hover:text-[#20f0e8]",
            },
          }}
        />
      </div>
    </div>
  )
}
