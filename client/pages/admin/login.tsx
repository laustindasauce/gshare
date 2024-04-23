import * as React from "react";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Alert, Collapse, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { getCookie, setCookie } from "cookies-next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import api from "@/lib/api";
import LoginLayout from "@/layouts/LoginLayout";
import { PublicSettingsModel, PublicSettingsResponse } from "@/lib/models";

type Props = {
  publicSettings: PublicSettingsModel;
};

const SignIn = ({ publicSettings }: Props) => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [twoFactor, setTwoFactor] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const loginData = {
      email: data.get("email") as string,
      password: data.get("password") as string,
    };

    if (loginData.email && loginData.password) {
      api
        .login({
          email: loginData.email,
          password: loginData.password,
        })
        .then((res) => {
          if (res.data.token) {
            setCookie("admin-token", res.data.token);
            setTimeout(() => {
              setLoading(false);
              router.push("/admin/dashboard");
            }, 1000);
          } else {
            setTwoFactor(true);
            setLoading(false);
            setEmail(loginData.email);
            return;
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setError("Invalid login credentials");
        });
    } else {
      setLoading(false);
      return setError("Email & password are required.");
    }
  };

  const handleSubmitFirstUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const loginData = {
      email: data.get("email") as string,
      password: data.get("password") as string,
    };

    if (loginData.email && loginData.password) {
      api
        .createFirstUser({
          email: loginData.email,
          password: loginData.password,
        })
        .then((res) => {
          if (res.data.token) {
            setCookie("admin-token", res.data.token);
            setTimeout(() => {
              setLoading(false);
              router.push("/admin/dashboard");
            }, 1000);
          } else {
            setTwoFactor(true);
            setLoading(false);
            setEmail(loginData.email);
            return;
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setError("Invalid login credentials");
        });
    } else {
      setLoading(false);
      return setError("Email & password are required.");
    }
  };

  const handle2FASubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const loginData = {
      email: email as string,
      code: data.get("code") as string,
    };

    if (loginData.email && loginData.code) {
      api
        .login2FA({
          email: loginData.email,
          code: loginData.code,
        })
        .then((res) => {
          setCookie("admin-token", res.data.token as string);
          setTimeout(() => {
            setLoading(false);
            router.push("/admin/dashboard");
          }, 1000);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setError("Invalid 2FA code.");
        });
    } else {
      setLoading(false);
      return setError("Code is required.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          sx={{ m: 1, width: 140, height: 140 }}
          src="/logo.svg"
          variant="rounded"
        />
        <Collapse in={!!error}>
          <Alert
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setError(null);
                }}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Collapse>

        {!!publicSettings?.new_application && (
          <Alert severity="info" sx={{ mb: 2, mt: 2 }}>
            Since there are no accounts created, you have the ability to create
            the admin user now.
          </Alert>
        )}
        {!twoFactor ? (
          <Box
            component="form"
            onSubmit={
              !!publicSettings?.new_application
                ? handleSubmitFirstUser
                : handleSubmit
            }
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              // color="secondary"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              type="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="password"
            />
            <LoadingButton
              loading={loading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {!!publicSettings?.new_application ? "Create Account" : "Sign In"}
            </LoadingButton>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handle2FASubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              // color="secondary"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              type="email"
              disabled
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="password"
              disabled
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="code"
              label="2FA Code"
              type="text"
              id="code"
              helperText="Check your email for the 2FA code"
              // I want to disable auto complete for this field
              autoComplete="off"
              autoFocus
            />
            <LoadingButton
              loading={loading}
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Verify
            </LoadingButton>
          </Box>
        )}
      </Box>
    </Container>
  );
};

SignIn.Layout = LoginLayout;

export default SignIn;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = getCookie("admin-token", context);
  if (!!token) {
    return {
      redirect: {
        destination: "/admin/dashboard",
        permanent: false,
      },
    };
  }

  try {
    const publicSettingsResp: PublicSettingsResponse =
      await api.getSettingsPublic();

    return { props: { publicSettings: publicSettingsResp.data } };
  } catch (error) {
    console.error(error);
  }

  return { props: {} };
};
