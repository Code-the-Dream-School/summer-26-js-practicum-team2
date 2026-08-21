import { getOAuthUrl } from "../../services/api";
import Button from "../Button/Button.component";

// Full-page links, not fetch calls — OAuth requires the browser to follow the provider's redirect chain.
export default function OAuthButtons() {
  return (
    <div className="flex flex-col gap-2">
      <Button as="a" href={getOAuthUrl("google")} variant="secondary">
        Continue with Google
      </Button>
      <Button as="a" href={getOAuthUrl("github")} variant="secondary">
        Continue with GitHub
      </Button>
    </div>
  );
}
