"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Signed in successfully");
        router.push("/teams");
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: "Manager",
      email: "manager@demo.com",
      password: "password123",
      color: "success",
    },
    {
      role: "Director",
      email: "director@demo.com",
      password: "password123",
      color: "info",
    },
    {
      role: "Member",
      email: "member@demo.com",
      password: "password123",
      color: "warning",
    },
  ];

  const handleDemoLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-header bg-primary text-white text-center">
                <h4 className="mb-0">Team Management System</h4>
                <small>Demo Application</small>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                {/* Demo Credentials Section */}
                <div className="mt-4">
                  <h6 className="text-center mb-3">Demo Credentials</h6>
                  <div className="row g-2">
                    {demoCredentials.map((cred, index) => (
                      <div key={index} className="col-12">
                        <div className={`card border-${cred.color} bg-light`}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className={`mb-1 text-${cred.color}`}>
                                  {cred.role}
                                </h6>
                                <small className="text-muted d-block">
                                  {cred.email}
                                </small>
                                <small className="text-muted">
                                  Password: {cred.password}
                                </small>
                              </div>
                              <button
                                type="button"
                                className={`btn btn-outline-${cred.color} btn-sm`}
                                onClick={() =>
                                  handleDemoLogin(cred.email, cred.password)
                                }
                                disabled={isLoading}
                              >
                                Use
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Click &quot;Use&quot; to auto-fill credentials, then click
                      &quot;Sign In&quot;
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
