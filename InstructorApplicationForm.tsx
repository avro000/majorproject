"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

const formSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  experience: z.string().refine((val) => ["1 year", "2 years", "3 years", "4 years", "5+ years"].includes(val), {
    message: "Experience must be a valid selection",
  }),
  expertise: z.string().min(2, "Please describe your expertise"),
  motivation: z.string().min(10, "Motivation should be at least 10 characters"),
})

type FormData = z.infer<typeof formSchema>

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const staggerFormItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function InstructorApplicationForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      experience: "",
      expertise: "",
      motivation: "",
    },
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const payload = {
      fullName: data.fullName,
      email: data.email,
      experience: data.experience,
      expertise: data.expertise,
      motivation: data.motivation,
    }

    try {
      const response = await fetch("http://localhost:9092/auth/apply-for-instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSubmitted(true)
        toast("Application submitted!", {
          description: "We'll get back to you shortly.",
          style: {
            backgroundColor: "#16a34a",
            color: "white",
            border: "#16a34a",
          },
        })
      } else {
        toast("Submission failed!", {
          description: "There was an error with the submission.",
          style: {
            backgroundColor: "#dc2626",
            color: "white",
          },
        })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast("An error occurred!", {
        description: "Please try again later.",
        style: {
          backgroundColor: "#dc2626",
          color: "white",
        },
      })
    }
    setLoading(false)
    form.reset()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      <motion.div
        className="w-1/2 h-full bg-cover bg-center hidden lg:block relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.img
          src="https://images.unsplash.com/photo-1699347914988-c61ec13c99c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHRlYWNoaW5nfGVufDB8fDB8fHww"
          alt="Instructor"
          className="h-full w-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute bottom-8 left-8 text-white max-w-sm"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-2">Join Our Teaching Team</h2>
          <p className="text-white/80 text-sm">
            Share your knowledge and expertise with eager learners around the world.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2 h-full flex justify-center items-center p-4 lg:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg h-full max-h-full overflow-y-auto shadow-lg border-0 flex flex-col bg-white">
          <CardHeader className="pb-3 flex-shrink-0">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <CardTitle className="text-xl lg:text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Apply to Teach on IntelliQuest
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hidden">
            {submitted ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 className="h-12 w-12 lg:h-16 lg:w-16 text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-lg lg:text-xl font-semibold mb-2 text-black">Application Submitted!</h3>
                <p className="text-muted-foreground mb-6 text-sm lg:text-base">
                  Thank you for your interest in teaching with us. We'll review your application and get back to you
                  soon.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <Form {...form}>
                <motion.form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3 lg:space-y-4 text-black"
                  variants={staggerFormItems}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeIn}>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-200 focus-visible:ring-blue-500 h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="border-slate-200 focus-visible:ring-blue-500 h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Teaching Experience (Years)</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full border-slate-200 focus:ring-blue-500 h-9">
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-white text-black">
                                {["1 year", "2 years", "3 years", "4 years", "5+ years"].map((value) => (
                                  <SelectItem
                                    key={value}
                                    value={value}
                                    className="data-[state=checked]:bg-[#f5f5f5] data-[state=checked]:text-black data-[highlighted]:bg-[#f5f5f5] data-[highlighted]:text-black"
                                  >
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">Area of Expertise</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-200 focus-visible:ring-blue-500 h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-sm">
                            Why do you want to teach on IntelliQuest?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              {...field}
                              className="border-slate-200 focus-visible:ring-blue-500 resize-none text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium h-9"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="text-sm">Submitting...</span>
                        </div>
                      ) : (
                        <span className="text-sm">Submit Application</span>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </Form>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile background overlay for small screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
    </div>
  )
}
