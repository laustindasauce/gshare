import React from "react";
import { Menu, MenuItem } from "@mui/material";

interface CustomContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMenuItemClick: (action: string) => void;
}

const ImageContextMenu: React.FC<CustomContextMenuProps> = ({
  anchorEl,
  onClose,
  onMenuItemClick,
}) => {
  // Attach scroll event listener to window
  React.useEffect(() => {
    const handleScroll = () => {
      // Close the menu when scrolling occurs
      onClose();
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      // Remove the event listener when the component is unmounted
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onClose]); // Empty dependency array ensures the effect runs only once on mount

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={() => onMenuItemClick("delete")}>Delete</MenuItem>
      <MenuItem onClick={() => onMenuItemClick("setFeatured")}>
        Set Featured Image
      </MenuItem>
      <MenuItem onClick={() => onMenuItemClick("openImage")}>
        View Full Image
      </MenuItem>
    </Menu>
  );
};

export default ImageContextMenu;
