import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Bot, Check, Linkedin } from "lucide-react";
// import { LightBulbIcon } from "./Icons";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const HeroCards = () => {
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[515px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[20px] bg-white/10 backdrop-blur-md border border-primary/20 drop-shadow-xl shadow-black/10 dark:shadow-white/10 rounded-xl">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage
              alt=""
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">John Doe</CardTitle>
            <CardDescription>@john_doe</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="text-muted-foreground">This website is awesome!</CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10 bg-white/10 backdrop-blur-md border border-primary/20">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <img
            src="https://i.pravatar.cc/150?img=58"
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center font-semibold text-2xl">Leo Miranda</CardTitle>
          <CardDescription className="font-normal text-[oklch(0.488_0.243_264.376)]">
            Frontend Developer
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-muted-foreground pb-2">
          <p>
            I really enjoy transforming ideas into functional software that
            exceeds expectations
          </p>
        </CardContent>

        <CardFooter>
          <div>
            <a
              rel="noreferrer noopener"
              href="https://github.com/leoMirandaa"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Github icon</span>
              <GitHubLogoIcon className="w-5 h-5" />
            </a>
            <a
              rel="noreferrer noopener"
              href="https://twitter.com/leo_mirand4"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">X icon</span>
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-foreground w-5 h-5"
              >
                <title>X</title>
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>

            <a
              rel="noreferrer noopener"
              href="https://www.linkedin.com/in/leopoldo-miranda/"
              target="_blank"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              <span className="sr-only">Linkedin icon</span>
              <Linkedin size="20" />
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10 bg-white/10 backdrop-blur-md border border-primary/20">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Java
            <Badge
              variant="secondary"
              className="text-sm text-[oklch(0.488_0.243_264.376)]"
            >
              Most popular
            </Badge>
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">&#8377;699</span>
          </div>

          <CardDescription>
            Comprehensive Java course covering basics, OOP, collections, and frameworks.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.488_0.243_264.376)]/80 transition duration-300 ease-in-out cursor-pointer text-primary">Enroll Now</Button>
        </CardContent>

        <CardFooter className="flex">
          <div className="space-y-4">
            {["Beginner to expert level", "Life time access", "Comprehensive learning"].map(
              (benefit: string) => (
                <span
                  key={benefit}
                  className="flex"
                >
                  <Check className="text-[oklch(0.488_0.243_264.376)]" />{" "}
                  <h3 className="ml-2">{benefit}</h3>
                </span>
              )
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute w-[350px] -right-[10px] bottom-[25px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10 bg-white/10 backdrop-blur-md border border-primary/20">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-[oklch(0.488_0.243_264.376)]/20 p-2 w-12 h-12 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-[oklch(0.488_0.243_264.376)]" />
          </div>
          <div>
            <CardTitle>Intellibot</CardTitle>
            <CardDescription className="text-md mt-2">
              Chatbots offer instant support and are available 24/7.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};