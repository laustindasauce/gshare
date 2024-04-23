import Snacks from "@/components/global/Snacks";
import AdminLayout from "@/layouts/AdminLayout";
import api from "@/lib/api";
import { SnacksModel, UserUpdateModel } from "@/lib/models";
import { useAuthUser } from "@/lib/swr";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Container,
  FormControlLabel,
  LinearProgress,
  Switch,
  TextField,
} from "@mui/material";
import { getCookie } from "cookies-next";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React from "react";

type Props = {
  token: string;
};

const SettingsHandler = ({ token }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const { user, isError, isLoading } = useAuthUser(token);
  const [userFormData, setUserFormData] = React.useState<UserUpdateModel>({});
  const [showPassword, setShowPassword] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState<SnacksModel>({
    open: false,
    severity: "success",
    locked: false,
    message: "",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUpdateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    api
      .updateUser(userFormData, user?.data.ID || "")
      .then(() => {
        setSnackbar({
          ...snackbar,
          severity: "success",
          message: `User updated.`,
          open: true,
        });
      })
      .catch((err) => {
        console.error(err);
        setSnackbar({
          ...snackbar,
          severity: "error",
          message: `User unable to be updated. Please check the logs.`,
          open: true,
        });
      })
      .finally(() => setLoading(false));
  };

  if (isLoading || !user) {
    return (
      <Container maxWidth="sm">
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleUpdateUser}
        noValidate
        sx={{ mt: 1 }}
      >
        <TextField
          // color="secondary"
          margin="normal"
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          type="email"
          value={userFormData.email || user.data.email}
          onChange={(e) =>
            setUserFormData({ ...userFormData, email: e.target.value })
          }
          autoFocus
        />
        <TextField
          margin="normal"
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="password"
          value={userFormData.password}
          onChange={(e) =>
            setUserFormData({ ...userFormData, password: e.target.value })
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={showPassword}
              onChange={() => setShowPassword((prevValue) => !prevValue)}
            />
          }
          label="Show Password"
        />
        <LoadingButton
          loading={loading}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Update User Login
        </LoadingButton>
      </Box>
      <Snacks snackbar={snackbar} handleSnackbarClose={handleSnackbarClose} />
    </Container>
  );
};

SettingsHandler.Layout = AdminLayout;
export default SettingsHandler;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const token = getCookie("admin-token", context);
  if (!token) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return { props: { token } };
};
