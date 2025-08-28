import { Button } from "@mantine/core";
import Link from "next/link";

// TODO: give this actual props. Limit the props?
import { ButtonProps } from "@mantine/core";

interface LinkButtonProps extends ButtonProps {
  href: string;
  children: React.ReactNode;
}

const LinkButton = (props: LinkButtonProps) => {
  return (
    <Button component={Link} {...props}>
      {props.children}
    </Button>
  );
};

export default LinkButton;
