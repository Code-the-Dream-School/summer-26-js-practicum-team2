import { Link } from "react-router";
import Button from "../shared/Button/Button.component";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <p className="text-6xl">🌱</p>
      <h1 className="font-heading text-h1 font-bold text-heading">Nothing sprouted here</h1>
      <p className="text-body text-neutral-600">The page you're looking for doesn't exist.</p>
      <Button as={Link} to="/">
        Take me home
      </Button>
    </div>
  );
}
