import { Button } from "../ui/button";


export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-muted/50 py-16 my-24 sm:my-32"
    >
      <div className="container flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold">
            Become an
            <span className="bg-gradient-to-b from-[oklch(0.488_0.243_264.376)]/60 to-[oklch(0.488_0.243_264.376)] text-transparent bg-clip-text">
              {" "}
              Instructor{" "}
            </span>
            at IntelliQuest
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Do you have a passion for teaching and a wealth of knowledge to share? Join our community of expert educators and shape the future of learners. Share your expertise, create impactful courses, and make a difference in education. Apply now to become an instructor at IntelliQuest!
          </p>
        </div>
        <div className="lg:w-1/3 flex justify-center">
          <a
            href="/apply-instructor"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="w-full md:w-auto bg-[oklch(0.488_0.243_264.376)] hover:bg-[oklch(0.488_0.243_264.376)]/90 transition duration-300 ease-in-out cursor-pointer text-primary">
              Apply Now
            </Button>
          </a>

        </div>
      </div>
    </section>

  );
};