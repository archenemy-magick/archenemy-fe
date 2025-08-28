import { Button } from "@mantine/core";
import Link from "next/link";

// TODO: give this actual props. Limit the props?
const LinkButton = (props) => {
  return (
    <Button component={Link} {...props}>
      {props.children}
    </Button>
  );
};

export default LinkButton;
