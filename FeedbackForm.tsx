import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useState } from "react"

const FeedbackSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    feedback: z.string().min(10, { message: "Feedback must be at least 10 characters." }),
    rating: z.number().min(1, { message: "Please select a rating." }),
})

const StarRating = ({
    value,
    onChange,
}: {
    value: number
    onChange: (value: number) => void
}) => {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null)

    const handleClick = (starValue: number) => {
        onChange(starValue)
    }

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= value
                const isHovered = hoveredStar !== null && star <= hoveredStar

                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        className={`
                text-2xl 
                transition-transform duration-200 
                ${isHovered ? "scale-110 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" : ""}
                ${isFilled ? "text-yellow-400" : "text-gray-400"}
              `}
                    >
                        <Star />
                    </button>
                )
            })}
        </div>
    )
}

export function FeedbackForm() {
    const form = useForm<z.infer<typeof FeedbackSchema>>({
        resolver: zodResolver(FeedbackSchema),
        defaultValues: {
            name: "",
            email: "",
            feedback: "",
            rating: 0,
        },
    })

    const [loading, setLoading] = useState(false);

    async function onSubmit(data: z.infer<typeof FeedbackSchema>) {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:9092/auth/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const message = await response.text();

            if (response.ok) {
                toast.success(message, {
                    style: {
                        backgroundColor: "#16a34a",
                        color: "white",
                    },
                });
            } else {
                toast.error("Error: " + message, {
                    style: {
                        backgroundColor: "#dc2626",
                        color: "white",
                    },
                });
            }
        } catch (error: any) {
            toast.error("Unexpected error occurred", {
                style: {
                    backgroundColor: "#dc2626",
                    color: "white",
                },
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto p-4 bg-sidebar">
            <CardHeader>
                <CardTitle className="flex justify-center items-center text-xl">Submit Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter your full name.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your@email.com" {...field} />
                                    </FormControl>
                                    <FormDescription>Enter a valid email address.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="feedback"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Feedback</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Your feedback..." rows={4} {...field} />
                                    </FormControl>
                                    <FormDescription>We really appreciate your feedback.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <StarRating value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormDescription>Rate your experience (1 to 5 stars).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    Submitting
                                    <div className="loader" />
                                </div>
                            ) : (
                                "Submit Feedback"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
