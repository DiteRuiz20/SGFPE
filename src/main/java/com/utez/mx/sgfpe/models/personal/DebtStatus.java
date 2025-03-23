package com.utez.mx.sgfpe.models.personal;

public enum DebtStatus {
    PENDING("pending", "Pendiente de pago"),
    PAID("paid", "Pagado"),
    OVERDUE("overdue", "Vencido"),
    CANCELLED("cancelled", "Cancelado");

    private final String code;
    private final String description;

    DebtStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    // Método útil para convertir de String a enum
    public static DebtStatus fromCode(String code) {
        for (DebtStatus status : DebtStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Estado de deuda no válido: " + code);
    }
} 