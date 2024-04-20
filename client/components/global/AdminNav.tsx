import { AppBar, Avatar, Button, Toolbar } from "@mui/material";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/router";
import React from "react";

type Props = {};

const AdminNav = (props: Props) => {
  const router = useRouter();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: "wrap" }}>
        <Avatar
          className="link"
          onClick={() => router.push("/admin/dashboard")}
          alt="logo"
          src="/logo.svg"
          variant="rounded"
        />
        <div style={{ flexGrow: 1 }}></div>
        <Button
          onClick={() => {
            deleteCookie("admin-token");
            router.push("/admin/login");
          }}
          variant="outlined"
          color="info"
          sx={{ my: 1, mx: 1.5 }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNav;
