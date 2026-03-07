import { Router } from "express";
import {
  getFilterGroups,
  createFilterGroup,
  updateFilterGroup,
  deleteFilterGroup,
  getFilterOptions,
  createFilterOption,
  updateFilterOption,
  deleteFilterOption,
} from "../controllers/filters";

const router = Router();

// Filter groups
router.get("/", getFilterGroups);
router.post("/", createFilterGroup);
router.put("/:id", updateFilterGroup);
router.delete("/:id", deleteFilterGroup);

// Options within a group
router.get("/:id/options", getFilterOptions);
router.post("/:id/options", createFilterOption);
router.put("/:id/options/:optionId", updateFilterOption);
router.delete("/:id/options/:optionId", deleteFilterOption);

export default router;
