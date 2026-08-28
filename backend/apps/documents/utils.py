"""
PDF and QR-code generation for Palladion.

QR codes encode the asset's plain asset_tag (e.g. "LKM-IT-0001") — that's the
same value the mobile scanner looks up via GET /assets/by-tag/<tag>, so a
scanned code and a typed tag hit the exact same endpoint.
"""
import io

import qrcode
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def generate_qr_image(data: str) -> io.BytesIO:
    """Return a PNG (as a BytesIO buffer) of a QR code encoding `data`."""
    qr = qrcode.QRCode(border=1, box_size=8)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


# Standard address-label size (63.5mm x 33.9mm, e.g. Avery 5160-style sheets),
# used both as the per-label size on an A4 grid and as the thermal label size.
LABEL_W_MM, LABEL_H_MM = 63.5, 33.9
A4_COLS, A4_ROWS = 3, 8
A4_MARGIN_MM = 5


def _draw_label(c, x, y, w, h, asset):
    qr_buf = generate_qr_image(asset.asset_tag)
    qr_size = h - 4 * mm
    c.drawImage(
        ImageReader(qr_buf), x + 2 * mm, y + 2 * mm, width=qr_size, height=qr_size, preserveAspectRatio=True
    )
    text_x = x + qr_size + 6 * mm
    c.setFont("Helvetica-Bold", 9)
    c.drawString(text_x, y + h - 10 * mm, asset.asset_tag)
    c.setFont("Helvetica", 7)
    c.drawString(text_x, y + h - 16 * mm, asset.name[:26])
    c.setFont("Helvetica", 6)
    c.drawString(text_x, y + h - 21 * mm, asset.category.name[:26])
    c.rect(x, y, w, h)


def build_label_pdf(assets, label_type: str = "A4") -> bytes:
    """Build a label sheet PDF for one or more assets.

    label_type="THERMAL": one label per page, sized to the label itself
    (what a thermal label printer expects).
    label_type="A4": a grid of labels on standard A4 sheets, for printing on
    ordinary paper/label stock.
    """
    buf = io.BytesIO()

    if label_type == "THERMAL":
        page_w, page_h = LABEL_W_MM * mm, LABEL_H_MM * mm
        c = canvas.Canvas(buf, pagesize=(page_w, page_h))
        for asset in assets:
            _draw_label(c, 0, 0, page_w, page_h, asset)
            c.showPage()
    else:
        c = canvas.Canvas(buf, pagesize=A4)
        page_w, page_h = A4
        label_w, label_h = LABEL_W_MM * mm, LABEL_H_MM * mm
        margin = A4_MARGIN_MM * mm
        cols, rows = A4_COLS, A4_ROWS
        per_page = cols * rows
        for idx, asset in enumerate(assets):
            pos = idx % per_page
            if idx > 0 and pos == 0:
                c.showPage()
            col = pos % cols
            row = pos // cols
            x = margin + col * label_w
            y = page_h - margin - (row + 1) * label_h
            _draw_label(c, x, y, label_w, label_h, asset)

    c.save()
    buf.seek(0)
    return buf.getvalue()


def _build_simple_doc(title: str, rows, footer_lines=None) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("PALLADION", styles["Title"]),
        Paragraph(title, styles["Heading2"]),
        Paragraph(f"Generated {timezone.now():%Y-%m-%d %H:%M}", styles["Normal"]),
        Spacer(1, 8 * mm),
    ]
    table = Table(rows, colWidths=[55 * mm, 110 * mm])
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (0, -1), colors.whitesmoke),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    if footer_lines:
        story.append(Spacer(1, 20 * mm))
        for line in footer_lines:
            story.append(Paragraph(line, styles["Normal"]))
    doc.build(story)
    buf.seek(0)
    return buf.getvalue()


def build_dispatch_note_pdf(assignment) -> bytes:
    a = assignment.asset
    rows = [
        ["Document", "Dispatch Note"],
        ["Asset Tag", a.asset_tag],
        ["Asset Name", a.name],
        ["Category", a.category.name],
        ["Assigned To", assignment.assigned_to.get_full_name()],
        ["Department", assignment.department.name if assignment.department else "—"],
        ["Assigned By", assignment.assigned_by.get_full_name() if assignment.assigned_by else "—"],
        ["Assigned At", f"{assignment.assigned_at:%Y-%m-%d %H:%M}"],
        ["Notes", assignment.notes or "—"],
    ]
    footer = [
        "By signing below, the recipient acknowledges receipt of the above asset in good working condition.",
        "<br/><br/>Recipient Signature: ______________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ______________",
    ]
    return _build_simple_doc(f"Dispatch Note — {a.asset_tag}", rows, footer)


def build_agreement_pdf(assignment) -> bytes:
    a = assignment.asset
    rows = [
        ["Document", "Custody Agreement"],
        ["Asset Tag", a.asset_tag],
        ["Asset Name", a.name],
        ["Assigned To", assignment.assigned_to.get_full_name()],
        ["Assigned At", f"{assignment.assigned_at:%Y-%m-%d %H:%M}"],
    ]
    footer = [
        "The undersigned agrees to take reasonable care of the above company asset, to use it only for "
        "authorized company purposes, and to report any loss, theft, or damage promptly to the IT/Admin "
        "department.",
        "<br/><br/>Employee Signature: ______________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ______________",
    ]
    return _build_simple_doc(f"Custody Agreement — {a.asset_tag}", rows, footer)


def build_return_note_pdf(assignment) -> bytes:
    a = assignment.asset
    rows = [
        ["Document", "Return Note"],
        ["Asset Tag", a.asset_tag],
        ["Asset Name", a.name],
        ["Returned By", assignment.assigned_to.get_full_name()],
        ["Assigned At", f"{assignment.assigned_at:%Y-%m-%d %H:%M}"],
        ["Returned At", f"{assignment.returned_at:%Y-%m-%d %H:%M}" if assignment.returned_at else "—"],
    ]
    footer = [
        "The above asset has been returned and its condition verified by an administrator.",
        "<br/><br/>Received By (Admin): ______________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ______________",
    ]
    return _build_simple_doc(f"Return Note — {a.asset_tag}", rows, footer)


def build_maintenance_report_pdf(log) -> bytes:
    a = log.asset
    rows = [
        ["Document", "Maintenance Report"],
        ["Asset Tag", a.asset_tag],
        ["Asset Name", a.name],
        ["Reported By", log.reported_by.get_full_name()],
        ["Reported At", f"{log.reported_at:%Y-%m-%d %H:%M}"],
        ["Status", log.get_status_display()],
        ["Issue", log.issue_description],
        ["Resolution Notes", log.resolution_notes or "—"],
        ["Resolved At", f"{log.resolved_at:%Y-%m-%d %H:%M}" if log.resolved_at else "—"],
    ]
    return _build_simple_doc(f"Maintenance Report — {a.asset_tag}", rows)
