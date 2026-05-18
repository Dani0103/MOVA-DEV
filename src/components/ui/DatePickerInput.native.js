import { useState } from "react";
import { TouchableOpacity, View, Text, Modal, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

/**
 * DatePickerInput — versión nativa (iOS / Android).
 * Props:
 *   value    : string "YYYY-MM-DD"
 *   onChange : (dateString: string) => void
 */
export default function DatePickerInput({ value, onChange }) {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  const dateObj = value ? new Date(value + "T00:00:00") : new Date();

  const displayStr = dateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShow(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0]);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme.card }]}
        onPress={() => setShow(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.primary} />
        <Text style={[styles.dateText, { color: theme.text }]}>{displayStr}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.textMuted} />
      </TouchableOpacity>

      {/* iOS: wrap in modal with "Listo" button */}
      {show && Platform.OS === "ios" && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                onPress={() => setShow(false)}
                style={[styles.doneBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.doneBtnText, { color: theme.background }]}>Listo</Text>
              </TouchableOpacity>
              <DateTimePicker
                value={dateObj}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={{ width: "100%" }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android: muestra inline */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  dateText: { flex: 1, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 30,
    alignItems: "center",
  },
  doneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  doneBtnText: { fontWeight: "bold", fontSize: 15 },
});
